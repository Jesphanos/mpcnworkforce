-- ============================================
-- PHASE 1: AUTOMATED FLAGS & ESCALATION SYSTEM
-- ============================================

-- Create attention signal levels enum
CREATE TYPE public.attention_level AS ENUM ('informational', 'support_needed', 'review_required');

-- Create attention signals table (humane term for "flags")
CREATE TABLE public.attention_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signal_type TEXT NOT NULL, -- 'repeated_revisions', 'repeated_adjustments', 'self_approval_attempt'
  level attention_level NOT NULL DEFAULT 'informational',
  trigger_count INTEGER NOT NULL DEFAULT 1,
  trigger_threshold INTEGER NOT NULL DEFAULT 3,
  related_entity_type TEXT, -- 'task', 'work_report'
  related_entity_id UUID,
  triggered_by UUID, -- who triggered the pattern (e.g., which admin)
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_notes TEXT,
  is_private BOOLEAN NOT NULL DEFAULT true, -- private first, escalate last
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attention_signals ENABLE ROW LEVEL SECURITY;

-- Policies: Only admins/overseer can view, users can see their own
CREATE POLICY "Users can view their own signals"
  ON public.attention_signals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Team leads can view team signals"
  ON public.attention_signals FOR SELECT
  USING (
    has_role(auth.uid(), 'team_lead') OR
    has_role(auth.uid(), 'report_admin') OR
    has_role(auth.uid(), 'user_admin') OR
    has_role(auth.uid(), 'general_overseer')
  );

CREATE POLICY "Admins can manage signals"
  ON public.attention_signals FOR ALL
  USING (
    has_role(auth.uid(), 'report_admin') OR
    has_role(auth.uid(), 'user_admin') OR
    has_role(auth.uid(), 'general_overseer')
  );

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_attention_signals_updated_at
  BEFORE UPDATE ON public.attention_signals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SELF-APPROVAL PREVENTION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.prevent_self_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent user from approving their own work
  IF NEW.team_lead_reviewed_by = NEW.user_id OR NEW.reviewed_by = NEW.user_id THEN
    -- Log the attempt as an attention signal
    INSERT INTO public.attention_signals (
      user_id, 
      signal_type, 
      level, 
      trigger_count,
      related_entity_type,
      related_entity_id,
      triggered_by
    ) VALUES (
      NEW.user_id,
      'self_approval_attempt',
      'review_required',
      1,
      TG_TABLE_NAME,
      NEW.id,
      NEW.user_id
    );
    
    RAISE EXCEPTION 'Self-approval is not permitted. This action has been logged.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply to work_reports
CREATE TRIGGER prevent_self_approval_work_reports
  BEFORE UPDATE ON public.work_reports
  FOR EACH ROW
  WHEN (
    NEW.team_lead_reviewed_by IS NOT NULL OR 
    NEW.reviewed_by IS NOT NULL
  )
  EXECUTE FUNCTION prevent_self_approval();

-- Apply to tasks
CREATE TRIGGER prevent_self_approval_tasks
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  WHEN (
    NEW.team_lead_reviewed_by IS NOT NULL OR 
    NEW.admin_reviewed_by IS NOT NULL
  )
  EXECUTE FUNCTION prevent_self_approval();

-- ============================================
-- AUTO-FLAG REPEATED REVISIONS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.check_revision_threshold()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  revision_count INTEGER;
  existing_signal UUID;
BEGIN
  -- Check if this is a rejection/revision request
  IF NEW.team_lead_status = 'rejected' OR NEW.status = 'rejected' THEN
    -- Count rejections in last 14 days
    SELECT COUNT(*) INTO revision_count
    FROM public.work_reports
    WHERE user_id = NEW.user_id
      AND (team_lead_status = 'rejected' OR status = 'rejected')
      AND created_at > now() - interval '14 days';
    
    -- If threshold reached (3+), create or update attention signal
    IF revision_count >= 3 THEN
      -- Check for existing unresolved signal
      SELECT id INTO existing_signal
      FROM public.attention_signals
      WHERE user_id = NEW.user_id
        AND signal_type = 'repeated_revisions'
        AND resolved_at IS NULL
      LIMIT 1;
      
      IF existing_signal IS NOT NULL THEN
        UPDATE public.attention_signals
        SET trigger_count = revision_count,
            level = CASE 
              WHEN revision_count >= 5 THEN 'review_required'::attention_level
              ELSE 'support_needed'::attention_level
            END,
            updated_at = now()
        WHERE id = existing_signal;
      ELSE
        INSERT INTO public.attention_signals (
          user_id,
          signal_type,
          level,
          trigger_count,
          trigger_threshold,
          triggered_by
        ) VALUES (
          NEW.user_id,
          'repeated_revisions',
          'support_needed',
          revision_count,
          3,
          COALESCE(NEW.team_lead_reviewed_by, NEW.reviewed_by)
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_revision_threshold_trigger
  AFTER UPDATE ON public.work_reports
  FOR EACH ROW
  EXECUTE FUNCTION check_revision_threshold();

-- ============================================
-- AUTO-FLAG REPEATED ADMIN ADJUSTMENTS
-- ============================================

CREATE OR REPLACE FUNCTION public.check_admin_adjustment_pattern()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  adjustment_count INTEGER;
  existing_signal UUID;
  admin_id UUID;
BEGIN
  admin_id := COALESCE(NEW.reviewed_by, NEW.admin_reviewed_by);
  
  -- Check if this is an admin override/adjustment
  IF admin_id IS NOT NULL AND NEW.admin_status IS NOT NULL THEN
    -- Count adjustments by same admin for same user in last 30 days
    SELECT COUNT(*) INTO adjustment_count
    FROM public.audit_logs
    WHERE entity_type IN ('work_report', 'task')
      AND action IN ('status_change', 'rate_change')
      AND performed_by = admin_id
      AND new_values->>'user_id' = NEW.user_id::text
      AND performed_at > now() - interval '30 days';
    
    -- If threshold reached (3+), alert overseer
    IF adjustment_count >= 3 THEN
      SELECT id INTO existing_signal
      FROM public.attention_signals
      WHERE user_id = NEW.user_id
        AND signal_type = 'repeated_adjustments'
        AND triggered_by = admin_id
        AND resolved_at IS NULL
      LIMIT 1;
      
      IF existing_signal IS NULL THEN
        INSERT INTO public.attention_signals (
          user_id,
          signal_type,
          level,
          trigger_count,
          trigger_threshold,
          triggered_by,
          is_private
        ) VALUES (
          NEW.user_id,
          'repeated_adjustments',
          'review_required',
          adjustment_count,
          3,
          admin_id,
          true
        );
        
        -- Notify overseer
        INSERT INTO public.notifications (user_id, title, message, type)
        SELECT ur.user_id, 
               'Attention Signal: Repeated Adjustments',
               'Admin has made ' || adjustment_count || ' adjustments to the same user. Review recommended.',
               'warning'
        FROM public.user_roles ur
        WHERE ur.role = 'general_overseer';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add indexes for performance
CREATE INDEX idx_attention_signals_user ON public.attention_signals(user_id);
CREATE INDEX idx_attention_signals_type ON public.attention_signals(signal_type);
CREATE INDEX idx_attention_signals_level ON public.attention_signals(level);
CREATE INDEX idx_attention_signals_unresolved ON public.attention_signals(user_id) WHERE resolved_at IS NULL;