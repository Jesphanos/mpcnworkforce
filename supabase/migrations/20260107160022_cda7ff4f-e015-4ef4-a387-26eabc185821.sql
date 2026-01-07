-- ============================================
-- PHASE 2: FINANCIAL FINALIZATION & CORRECTION LOCKS
-- ============================================

-- Create financial period status enum
CREATE TYPE public.financial_period_status AS ENUM ('draft', 'finalized', 'corrected');

-- Add status and correction fields to mpcn_financials
ALTER TABLE public.mpcn_financials 
  ADD COLUMN status financial_period_status NOT NULL DEFAULT 'draft',
  ADD COLUMN finalized_at TIMESTAMPTZ,
  ADD COLUMN finalized_by UUID,
  ADD COLUMN correction_reason TEXT,
  ADD COLUMN corrected_at TIMESTAMPTZ,
  ADD COLUMN corrected_by UUID,
  ADD COLUMN disclosure_notes TEXT,
  ADD COLUMN original_total_pool NUMERIC,
  ADD COLUMN original_total_profit NUMERIC;

-- Function to enforce finalization rules
CREATE OR REPLACE FUNCTION public.enforce_financial_finalization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If already finalized, only overseer can modify and must provide correction reason
  IF OLD.status = 'finalized' THEN
    -- Check if user is overseer
    IF NOT has_role(auth.uid(), 'general_overseer') THEN
      RAISE EXCEPTION 'Only the General Overseer can modify finalized financial periods.';
    END IF;
    
    -- Require correction reason
    IF NEW.correction_reason IS NULL OR NEW.correction_reason = '' THEN
      RAISE EXCEPTION 'A correction reason is required when modifying finalized financial periods.';
    END IF;
    
    -- Store original values if not already stored
    IF OLD.original_total_pool IS NULL THEN
      NEW.original_total_pool := OLD.total_pool;
      NEW.original_total_profit := OLD.total_profit;
    END IF;
    
    -- Mark as corrected
    NEW.status := 'corrected';
    NEW.corrected_at := now();
    NEW.corrected_by := auth.uid();
    
    -- Log the correction in audit
    PERFORM log_audit_event(
      'mpcn_financials',
      NEW.id,
      'financial_correction',
      auth.uid(),
      jsonb_build_object('total_pool', OLD.total_pool, 'total_profit', OLD.total_profit, 'status', OLD.status),
      jsonb_build_object('total_pool', NEW.total_pool, 'total_profit', NEW.total_profit, 'status', NEW.status),
      NEW.correction_reason
    );
  END IF;
  
  -- If finalizing, record who and when
  IF OLD.status = 'draft' AND NEW.status = 'finalized' THEN
    NEW.finalized_at := now();
    NEW.finalized_by := auth.uid();
    
    -- Log finalization
    PERFORM log_audit_event(
      'mpcn_financials',
      NEW.id,
      'financial_finalization',
      auth.uid(),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'total_pool', NEW.total_pool, 'total_profit', NEW.total_profit),
      NEW.disclosure_notes
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_financial_finalization_trigger
  BEFORE UPDATE ON public.mpcn_financials
  FOR EACH ROW
  EXECUTE FUNCTION enforce_financial_finalization();

-- ============================================
-- PHASE 3: PERFORMANCE INDEXES
-- ============================================

-- Add indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_report_history_report ON public.report_history(report_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON public.audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_at ON public.audit_logs(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_final_status ON public.tasks(final_status);
CREATE INDEX IF NOT EXISTS idx_tasks_work_date ON public.tasks(work_date DESC);
CREATE INDEX IF NOT EXISTS idx_work_reports_user ON public.work_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_work_reports_final_status ON public.work_reports(final_status);
CREATE INDEX IF NOT EXISTS idx_work_reports_work_date ON public.work_reports(work_date DESC);
CREATE INDEX IF NOT EXISTS idx_investments_created_by ON public.investments(created_by);
CREATE INDEX IF NOT EXISTS idx_investment_returns_user ON public.investment_returns(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_returns_profit_date ON public.investment_returns(profit_date DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, final_status);
CREATE INDEX IF NOT EXISTS idx_work_reports_user_status ON public.work_reports(user_id, final_status);