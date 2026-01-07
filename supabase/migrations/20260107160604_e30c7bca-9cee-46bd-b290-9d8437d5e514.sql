-- ============================================
-- PHASE 4: RESOLUTION REQUESTS (DISPUTE HANDLING)
-- ============================================

-- Create resolution request status enum
CREATE TYPE public.resolution_status AS ENUM ('open', 'under_review', 'mediation', 'resolved', 'escalated');

-- Create resolution requests table (humane term for disputes)
CREATE TABLE public.resolution_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  raised_by UUID NOT NULL,
  against_user_id UUID, -- optional, may be against system/policy
  category TEXT NOT NULL, -- 'work_decision', 'rate_dispute', 'conduct', 'policy', 'other'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_url TEXT,
  status resolution_status NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Assignment & handling
  assigned_to UUID,
  assigned_at TIMESTAMPTZ,
  
  -- SLA tracking
  sla_due_at TIMESTAMPTZ, -- auto-calculated based on priority
  sla_breached BOOLEAN DEFAULT false,
  
  -- Mediation
  mediator_id UUID,
  mediation_started_at TIMESTAMPTZ,
  mediation_notes TEXT,
  
  -- Resolution
  resolution TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  
  -- Escalation
  escalated_to UUID,
  escalated_at TIMESTAMPTZ,
  escalation_reason TEXT,
  
  -- Related entities
  related_entity_type TEXT, -- 'task', 'work_report', 'financial', etc.
  related_entity_id UUID,
  
  -- Privacy (private first principle)
  is_confidential BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resolution_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own requests"
  ON public.resolution_requests FOR SELECT
  USING (auth.uid() = raised_by);

CREATE POLICY "Users can create requests"
  ON public.resolution_requests FOR INSERT
  WITH CHECK (auth.uid() = raised_by);

CREATE POLICY "Assigned handlers can view"
  ON public.resolution_requests FOR SELECT
  USING (auth.uid() = assigned_to OR auth.uid() = mediator_id);

CREATE POLICY "Admins can view all requests"
  ON public.resolution_requests FOR SELECT
  USING (
    has_role(auth.uid(), 'report_admin') OR
    has_role(auth.uid(), 'user_admin') OR
    has_role(auth.uid(), 'general_overseer')
  );

CREATE POLICY "Admins can manage requests"
  ON public.resolution_requests FOR ALL
  USING (
    has_role(auth.uid(), 'report_admin') OR
    has_role(auth.uid(), 'user_admin') OR
    has_role(auth.uid(), 'general_overseer')
  );

-- Trigger for updated_at
CREATE TRIGGER update_resolution_requests_updated_at
  BEFORE UPDATE ON public.resolution_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-set SLA based on priority
CREATE OR REPLACE FUNCTION public.set_resolution_sla()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set SLA based on priority
  NEW.sla_due_at := CASE NEW.priority
    WHEN 'urgent' THEN now() + interval '24 hours'
    WHEN 'high' THEN now() + interval '3 days'
    WHEN 'normal' THEN now() + interval '7 days'
    WHEN 'low' THEN now() + interval '14 days'
    ELSE now() + interval '7 days'
  END;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_resolution_sla_trigger
  BEFORE INSERT ON public.resolution_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_resolution_sla();

-- Function to log resolution changes
CREATE OR REPLACE FUNCTION public.log_resolution_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM log_audit_event(
      'resolution_request',
      NEW.id,
      'status_change',
      auth.uid(),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'assigned_to', NEW.assigned_to),
      NEW.resolution
    );
    
    -- Notify the requester of status changes
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.raised_by,
      'Resolution Request Updated',
      'Your request "' || NEW.title || '" status has been updated to: ' || NEW.status::text,
      CASE 
        WHEN NEW.status = 'resolved' THEN 'success'
        WHEN NEW.status = 'escalated' THEN 'warning'
        ELSE 'info'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_resolution_changes_trigger
  AFTER UPDATE ON public.resolution_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_resolution_changes();

-- Indexes
CREATE INDEX idx_resolution_requests_raised_by ON public.resolution_requests(raised_by);
CREATE INDEX idx_resolution_requests_status ON public.resolution_requests(status);
CREATE INDEX idx_resolution_requests_assigned ON public.resolution_requests(assigned_to);
CREATE INDEX idx_resolution_requests_sla ON public.resolution_requests(sla_due_at) WHERE status NOT IN ('resolved');

-- ============================================
-- PHASE 5: DEPARTMENT STRUCTURE
-- ============================================

-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  head_id UUID, -- department head (references profiles)
  parent_department_id UUID REFERENCES public.departments(id), -- for nested departments
  skill_focus TEXT,
  region TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view departments"
  ON public.departments FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can view all departments"
  ON public.departments FOR SELECT
  USING (
    has_role(auth.uid(), 'user_admin') OR
    has_role(auth.uid(), 'general_overseer')
  );

CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  USING (
    has_role(auth.uid(), 'user_admin') OR
    has_role(auth.uid(), 'general_overseer')
  );

-- Trigger for updated_at
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add department_id to teams table
ALTER TABLE public.teams
  ADD COLUMN department_id UUID REFERENCES public.departments(id);

-- Create index
CREATE INDEX idx_teams_department ON public.teams(department_id);
CREATE INDEX idx_departments_head ON public.departments(head_id);
CREATE INDEX idx_departments_parent ON public.departments(parent_department_id);