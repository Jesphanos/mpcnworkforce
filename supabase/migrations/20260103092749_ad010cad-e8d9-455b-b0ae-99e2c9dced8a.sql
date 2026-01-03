-- Create tasks table with mutable rates
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL,
  work_date DATE NOT NULL,
  hours_worked NUMERIC NOT NULL DEFAULT 0,
  base_rate NUMERIC NOT NULL DEFAULT 0,
  current_rate NUMERIC NOT NULL DEFAULT 0,
  calculated_earnings NUMERIC GENERATED ALWAYS AS (hours_worked * current_rate) STORED,
  status TEXT NOT NULL DEFAULT 'pending',
  team_lead_status TEXT DEFAULT NULL,
  team_lead_rejection_reason TEXT,
  team_lead_reviewed_by UUID,
  team_lead_reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_status TEXT DEFAULT NULL,
  admin_rejection_reason TEXT,
  admin_reviewed_by UUID,
  admin_reviewed_at TIMESTAMP WITH TIME ZONE,
  final_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add rate columns to work_reports
ALTER TABLE public.work_reports 
ADD COLUMN IF NOT EXISTS base_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS team_lead_status TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS team_lead_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS team_lead_reviewed_by UUID,
ADD COLUMN IF NOT EXISTS team_lead_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_status TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS admin_override_reason TEXT,
ADD COLUMN IF NOT EXISTS final_status TEXT DEFAULT 'pending';

-- Create audit_logs table for full audit trail
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID NOT NULL,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  previous_values JSONB,
  new_values JSONB,
  notes TEXT
);

-- Enable RLS on new tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Tasks RLS policies
CREATE POLICY "Users can view their own tasks"
ON public.tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
ON public.tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending tasks"
ON public.tasks FOR UPDATE
USING (auth.uid() = user_id AND final_status = 'pending' AND team_lead_status IS NULL);

CREATE POLICY "Team leads can view all tasks"
ON public.tasks FOR SELECT
USING (has_role(auth.uid(), 'team_lead'::app_role) OR has_role(auth.uid(), 'report_admin'::app_role) OR has_role(auth.uid(), 'finance_hr_admin'::app_role) OR has_role(auth.uid(), 'investment_admin'::app_role) OR has_role(auth.uid(), 'user_admin'::app_role) OR has_role(auth.uid(), 'general_overseer'::app_role));

CREATE POLICY "Team leads and admins can update tasks"
ON public.tasks FOR UPDATE
USING (has_role(auth.uid(), 'team_lead'::app_role) OR has_role(auth.uid(), 'report_admin'::app_role) OR has_role(auth.uid(), 'finance_hr_admin'::app_role) OR has_role(auth.uid(), 'investment_admin'::app_role) OR has_role(auth.uid(), 'user_admin'::app_role) OR has_role(auth.uid(), 'general_overseer'::app_role));

-- Audit logs RLS policies
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (has_role(auth.uid(), 'report_admin'::app_role) OR has_role(auth.uid(), 'finance_hr_admin'::app_role) OR has_role(auth.uid(), 'user_admin'::app_role) OR has_role(auth.uid(), 'general_overseer'::app_role));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_action TEXT,
  p_performed_by UUID,
  p_previous_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (entity_type, entity_id, action, performed_by, previous_values, new_values, notes)
  VALUES (p_entity_type, p_entity_id, p_action, p_performed_by, p_previous_values, p_new_values, p_notes)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Create trigger function for task audit logging
CREATE OR REPLACE FUNCTION public.audit_task_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.team_lead_status IS DISTINCT FROM NEW.team_lead_status OR 
       OLD.admin_status IS DISTINCT FROM NEW.admin_status OR
       OLD.final_status IS DISTINCT FROM NEW.final_status THEN
      PERFORM log_audit_event(
        'task',
        NEW.id,
        'status_change',
        COALESCE(NEW.admin_reviewed_by, NEW.team_lead_reviewed_by, auth.uid()),
        jsonb_build_object('team_lead_status', OLD.team_lead_status, 'admin_status', OLD.admin_status, 'final_status', OLD.final_status),
        jsonb_build_object('team_lead_status', NEW.team_lead_status, 'admin_status', NEW.admin_status, 'final_status', NEW.final_status),
        NULL
      );
    END IF;
    
    IF OLD.current_rate IS DISTINCT FROM NEW.current_rate THEN
      PERFORM log_audit_event(
        'task',
        NEW.id,
        'rate_change',
        auth.uid(),
        jsonb_build_object('current_rate', OLD.current_rate),
        jsonb_build_object('current_rate', NEW.current_rate),
        NULL
      );
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event(
      'task',
      NEW.id,
      'created',
      NEW.user_id,
      NULL,
      jsonb_build_object('title', NEW.title, 'base_rate', NEW.base_rate, 'current_rate', NEW.current_rate),
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for work_reports audit logging
CREATE OR REPLACE FUNCTION public.audit_work_report_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.team_lead_status IS DISTINCT FROM NEW.team_lead_status OR 
       OLD.admin_status IS DISTINCT FROM NEW.admin_status OR
       OLD.final_status IS DISTINCT FROM NEW.final_status OR
       OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM log_audit_event(
        'work_report',
        NEW.id,
        'status_change',
        COALESCE(NEW.team_lead_reviewed_by, NEW.reviewed_by, auth.uid()),
        jsonb_build_object('status', OLD.status, 'team_lead_status', OLD.team_lead_status, 'admin_status', OLD.admin_status, 'final_status', OLD.final_status),
        jsonb_build_object('status', NEW.status, 'team_lead_status', NEW.team_lead_status, 'admin_status', NEW.admin_status, 'final_status', NEW.final_status),
        NEW.admin_override_reason
      );
    END IF;
    
    IF OLD.current_rate IS DISTINCT FROM NEW.current_rate THEN
      PERFORM log_audit_event(
        'work_report',
        NEW.id,
        'rate_change',
        auth.uid(),
        jsonb_build_object('current_rate', OLD.current_rate),
        jsonb_build_object('current_rate', NEW.current_rate),
        NULL
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER audit_tasks_trigger
AFTER INSERT OR UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.audit_task_changes();

CREATE TRIGGER audit_work_reports_trigger
AFTER UPDATE ON public.work_reports
FOR EACH ROW EXECUTE FUNCTION public.audit_work_report_changes();

-- Update role hierarchy function
CREATE OR REPLACE FUNCTION public.get_role_level(role_name app_role)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE role_name
    WHEN 'general_overseer' THEN 1
    WHEN 'user_admin' THEN 2
    WHEN 'investment_admin' THEN 3
    WHEN 'finance_hr_admin' THEN 4
    WHEN 'report_admin' THEN 5
    WHEN 'team_lead' THEN 6
    WHEN 'employee' THEN 7
  END
$$;

-- Function to check if user can override another role
CREATE OR REPLACE FUNCTION public.can_override_role(_user_id UUID, _target_role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND get_role_level(ur.role) < get_role_level(_target_role)
  )
$$;

-- Enable realtime for tasks and audit_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;

-- Create indexes for performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_final_status ON public.tasks(final_status);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_performed_at ON public.audit_logs(performed_at DESC);

-- Update timestamp trigger for tasks
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();