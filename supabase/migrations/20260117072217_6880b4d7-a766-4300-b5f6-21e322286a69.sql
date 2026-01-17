-- Fix the overly permissive investor_audit_log insert policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.investor_audit_log;

-- Only allow inserts through the log_investor_action function (which is SECURITY DEFINER)
-- The function handles proper authorization
CREATE POLICY "Authenticated users can log via function"
  ON public.investor_audit_log
  FOR INSERT
  WITH CHECK (
    -- Allow if performed by auth user or admin
    performed_by = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('investment_admin', 'finance_hr_admin', 'general_overseer')
    )
  );