-- Add investor type enum
CREATE TYPE public.investor_type AS ENUM (
  'financial',
  'strategic',
  'employee_investor',
  'founding'
);

-- Add investor verification status enum
CREATE TYPE public.investor_verification_status AS ENUM (
  'pending',
  'verified',
  'rejected'
);

-- Add investment scope enum
CREATE TYPE public.investment_scope AS ENUM (
  'general_fund',
  'project_specific',
  'team_specific'
);

-- Add investment risk level enum
CREATE TYPE public.investment_risk_level AS ENUM (
  'low',
  'medium',
  'high'
);

-- Add investment status enum
CREATE TYPE public.investment_status AS ENUM (
  'active',
  'matured',
  'loss',
  'recovered',
  'withdrawn'
);

-- Add withdrawal status enum
CREATE TYPE public.withdrawal_status AS ENUM (
  'requested',
  'approved',
  'paid',
  'rejected'
);

-- Enhance profiles table with investor-specific fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS investor_type public.investor_type,
  ADD COLUMN IF NOT EXISTS investor_verification_status public.investor_verification_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS investor_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS investor_verified_by UUID,
  ADD COLUMN IF NOT EXISTS investor_entity_type TEXT DEFAULT 'individual', -- 'individual' or 'organization'
  ADD COLUMN IF NOT EXISTS total_withdrawn NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reinvested NUMERIC(12,2) DEFAULT 0;

-- Enhance investments table with more tracking fields
ALTER TABLE public.investments
  ADD COLUMN IF NOT EXISTS investment_scope public.investment_scope DEFAULT 'general_fund',
  ADD COLUMN IF NOT EXISTS risk_level public.investment_risk_level DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS investor_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS target_project_id UUID,
  ADD COLUMN IF NOT EXISTS target_team_id UUID REFERENCES public.teams(id),
  ADD COLUMN IF NOT EXISTS expected_return_model TEXT DEFAULT 'profit_share', -- 'profit_share', 'fixed_roi', 'equity_like'
  ADD COLUMN IF NOT EXISTS gross_profit NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS operational_deduction NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_profit NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS investor_share NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loss_amount NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_reinvestment BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_investment_id UUID REFERENCES public.investments(id),
  ADD COLUMN IF NOT EXISTS holding_period_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS maturity_date DATE;

-- Create withdrawal requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL REFERENCES public.profiles(id),
  investment_id UUID REFERENCES public.investments(id),
  requested_amount NUMERIC(12,2) NOT NULL,
  available_balance NUMERIC(12,2) NOT NULL,
  status public.withdrawal_status DEFAULT 'requested',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create investor audit log for transparency
CREATE TABLE IF NOT EXISTS public.investor_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL REFERENCES public.profiles(id),
  action_type TEXT NOT NULL, -- 'investment', 'withdrawal', 'reinvestment', 'return_distribution', 'verification'
  amount NUMERIC(12,2),
  related_entity_type TEXT,
  related_entity_id UUID,
  description TEXT,
  performed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create investor notices table
CREATE TABLE IF NOT EXISTS public.investor_notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notice_type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'distribution'
  target_investor_type public.investor_type, -- NULL means all investors
  is_global BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_notices ENABLE ROW LEVEL SECURITY;

-- RLS policies for withdrawal_requests
CREATE POLICY "Investors can view their own withdrawal requests"
  ON public.withdrawal_requests
  FOR SELECT
  USING (investor_id = auth.uid());

CREATE POLICY "Investors can create withdrawal requests"
  ON public.withdrawal_requests
  FOR INSERT
  WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Admins can view all withdrawal requests"
  ON public.withdrawal_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('investment_admin', 'finance_hr_admin', 'general_overseer')
    )
  );

CREATE POLICY "Admins can update withdrawal requests"
  ON public.withdrawal_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('investment_admin', 'finance_hr_admin', 'general_overseer')
    )
  );

-- RLS policies for investor_audit_log
CREATE POLICY "Investors can view their own audit log"
  ON public.investor_audit_log
  FOR SELECT
  USING (investor_id = auth.uid());

CREATE POLICY "Admins can view all audit logs"
  ON public.investor_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('investment_admin', 'finance_hr_admin', 'general_overseer')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.investor_audit_log
  FOR INSERT
  WITH CHECK (true);

-- RLS policies for investor_notices
CREATE POLICY "Investors can view notices"
  ON public.investor_notices
  FOR SELECT
  USING (
    is_global = true
    OR (
      SELECT investor_type FROM public.profiles WHERE id = auth.uid()
    ) = target_investor_type
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('investment_admin', 'finance_hr_admin', 'general_overseer')
    )
  );

CREATE POLICY "Admins can manage notices"
  ON public.investor_notices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('investment_admin', 'finance_hr_admin', 'general_overseer')
    )
  );

-- Function to log investor actions
CREATE OR REPLACE FUNCTION public.log_investor_action(
  p_investor_id UUID,
  p_action_type TEXT,
  p_amount NUMERIC,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_performed_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.investor_audit_log (
    investor_id, action_type, amount, related_entity_type, 
    related_entity_id, description, performed_by
  )
  VALUES (
    p_investor_id, p_action_type, p_amount, p_related_entity_type,
    p_related_entity_id, p_description, COALESCE(p_performed_by, auth.uid())
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Trigger for withdrawal request changes
CREATE OR REPLACE FUNCTION public.log_withdrawal_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_investor_action(
      NEW.investor_id,
      'withdrawal_request',
      NEW.requested_amount,
      'withdrawal_request',
      NEW.id,
      'Withdrawal requested'
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM log_investor_action(
      NEW.investor_id,
      'withdrawal_' || NEW.status::text,
      NEW.requested_amount,
      'withdrawal_request',
      NEW.id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Withdrawal approved'
        WHEN NEW.status = 'paid' THEN 'Withdrawal paid'
        WHEN NEW.status = 'rejected' THEN 'Withdrawal rejected: ' || COALESCE(NEW.rejection_reason, 'No reason provided')
        ELSE 'Withdrawal status changed to ' || NEW.status::text
      END,
      COALESCE(NEW.reviewed_by, NEW.paid_by)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_withdrawal_request_change
  AFTER INSERT OR UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.log_withdrawal_changes();

-- Add updated_at trigger
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_investor ON public.withdrawal_requests(investor_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_investor_audit_log_investor ON public.investor_audit_log(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON public.investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_profiles_investor_type ON public.profiles(investor_type) WHERE is_investor = true;