-- Create report_history table for immutable audit trail of report status changes
CREATE TABLE public.report_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.work_reports(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  previous_status text,
  new_status text,
  performed_by uuid NOT NULL,
  comment text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;

-- RLS: System can insert (via triggers/functions)
CREATE POLICY "System can insert report history"
ON public.report_history
FOR INSERT
WITH CHECK (true);

-- RLS: Workers can view their own report history
CREATE POLICY "Workers can view own report history"
ON public.report_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.work_reports wr 
    WHERE wr.id = report_id AND wr.user_id = auth.uid()
  )
);

-- RLS: Team leads and admins can view all report history
CREATE POLICY "Leads and admins can view report history"
ON public.report_history
FOR SELECT
USING (
  has_role(auth.uid(), 'team_lead'::app_role) OR 
  has_role(auth.uid(), 'report_admin'::app_role) OR 
  has_role(auth.uid(), 'finance_hr_admin'::app_role) OR
  has_role(auth.uid(), 'general_overseer'::app_role)
);

-- Create mpcn_financials table for organizational financial tracking
CREATE TABLE public.mpcn_financials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_pool numeric NOT NULL DEFAULT 0,
  total_profit numeric NOT NULL DEFAULT 0,
  profit_date date NOT NULL,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.mpcn_financials ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can view financials (investors need access)
CREATE POLICY "Authenticated users can view financials"
ON public.mpcn_financials
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS: Only investment_admin and general_overseer can manage
CREATE POLICY "Investment admins can manage financials"
ON public.mpcn_financials
FOR ALL
USING (
  has_role(auth.uid(), 'investment_admin'::app_role) OR 
  has_role(auth.uid(), 'general_overseer'::app_role)
);

-- Create investment_returns table for tracking individual returns
CREATE TABLE public.investment_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id uuid REFERENCES public.investments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  return_amount numeric NOT NULL DEFAULT 0,
  profit_date date NOT NULL,
  financial_period_id uuid REFERENCES public.mpcn_financials(id),
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.investment_returns ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own returns
CREATE POLICY "Users can view own returns"
ON public.investment_returns
FOR SELECT
USING (auth.uid() = user_id);

-- RLS: Investment admins can view all returns
CREATE POLICY "Investment admins can view all returns"
ON public.investment_returns
FOR SELECT
USING (
  has_role(auth.uid(), 'investment_admin'::app_role) OR 
  has_role(auth.uid(), 'general_overseer'::app_role)
);

-- RLS: Investment admins can manage returns
CREATE POLICY "Investment admins can manage returns"
ON public.investment_returns
FOR ALL
USING (
  has_role(auth.uid(), 'investment_admin'::app_role) OR 
  has_role(auth.uid(), 'general_overseer'::app_role)
);

-- Add skill_focus and region to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS skill_focus text,
ADD COLUMN IF NOT EXISTS region text;

-- Add percentage_of_pool to investments table for tracking share
ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS percentage_of_pool numeric DEFAULT 0;

-- Create trigger function to auto-insert report_history on status changes
CREATE OR REPLACE FUNCTION public.track_report_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status OR 
     OLD.team_lead_status IS DISTINCT FROM NEW.team_lead_status OR
     OLD.admin_status IS DISTINCT FROM NEW.admin_status OR
     OLD.final_status IS DISTINCT FROM NEW.final_status THEN
    INSERT INTO public.report_history (
      report_id, 
      action, 
      previous_status, 
      new_status, 
      performed_by, 
      comment
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.admin_status = 'overridden' THEN 'override'
        WHEN NEW.status = 'rejected' OR NEW.team_lead_status = 'rejected' THEN 'rejection'
        WHEN NEW.final_status = 'approved' THEN 'approval'
        ELSE 'status_change'
      END,
      COALESCE(OLD.final_status, OLD.status),
      COALESCE(NEW.final_status, NEW.status),
      COALESCE(NEW.reviewed_by, NEW.team_lead_reviewed_by, auth.uid()),
      COALESCE(NEW.admin_override_reason, NEW.team_lead_rejection_reason, NEW.rejection_reason)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on work_reports
DROP TRIGGER IF EXISTS track_report_history ON public.work_reports;
CREATE TRIGGER track_report_history
  AFTER UPDATE ON public.work_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.track_report_status_change();

-- Add updated_at trigger for mpcn_financials
CREATE TRIGGER update_mpcn_financials_updated_at
  BEFORE UPDATE ON public.mpcn_financials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_report_history_report_id ON public.report_history(report_id);
CREATE INDEX IF NOT EXISTS idx_report_history_performed_by ON public.report_history(performed_by);
CREATE INDEX IF NOT EXISTS idx_investment_returns_user_id ON public.investment_returns(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_returns_investment_id ON public.investment_returns(investment_id);
CREATE INDEX IF NOT EXISTS idx_mpcn_financials_profit_date ON public.mpcn_financials(profit_date);