-- =====================================================
-- MPCN SYSTEM HARDENING MIGRATION
-- Task Contracts, Leadership Signals, Learning Feedback,
-- Financial Narratives, Collaboration, Scale Governance
-- =====================================================

-- 1. TASK CONTRACT LAYER
-- Add contract fields to tasks table for explicit responsibility definitions
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS task_purpose text,
ADD COLUMN IF NOT EXISTS success_criteria text,
ADD COLUMN IF NOT EXISTS effort_band text DEFAULT 'medium' CHECK (effort_band IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS review_type text DEFAULT 'team_lead' CHECK (review_type IN ('automated', 'team_lead', 'admin')),
ADD COLUMN IF NOT EXISTS payment_logic_type text DEFAULT 'fixed' CHECK (payment_logic_type IN ('fixed', 'variable', 'milestone')),
ADD COLUMN IF NOT EXISTS failure_handling_policy text DEFAULT 'revision' CHECK (failure_handling_policy IN ('revision', 'partial_approval', 'escalation'));

-- 2. LEADERSHIP QUALITY SIGNALS TABLE
-- Track leadership mentorship quality (non-financial incentives)
CREATE TABLE IF NOT EXISTS public.leadership_signals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('team_lead', 'report_admin', 'investment_admin', 'finance_hr_admin', 'user_admin', 'general_overseer')),
  signal_type text NOT NULL CHECK (signal_type IN (
    'revision_helpfulness', 'worker_improvement_delta', 'escalation_restraint',
    'override_justification_quality', 'reversal_rate', 'fairness_feedback'
  )),
  signal_value numeric NOT NULL DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  notes text,
  calculated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on leadership_signals
ALTER TABLE public.leadership_signals ENABLE ROW LEVEL SECURITY;

-- Only Overseer can view leadership signals
CREATE POLICY "Overseer can view leadership signals"
ON public.leadership_signals
FOR SELECT
USING (has_role(auth.uid(), 'general_overseer'::app_role));

-- System can insert leadership signals
CREATE POLICY "System can insert leadership signals"
ON public.leadership_signals
FOR INSERT
WITH CHECK (true);

-- 3. LEARNING INSIGHTS TABLE
-- Post-resolution learning feedback linked to skills
CREATE TABLE IF NOT EXISTS public.learning_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('task', 'report')),
  entity_id uuid NOT NULL,
  what_went_well text,
  what_to_improve text,
  skill_signal text,
  suggestions text[],
  generated_by text NOT NULL CHECK (generated_by IN ('system', 'reviewer', 'overseer')),
  resolution_status text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on learning_insights
ALTER TABLE public.learning_insights ENABLE ROW LEVEL SECURITY;

-- Workers can view their own learning insights
CREATE POLICY "Users can view own learning insights"
ON public.learning_insights
FOR SELECT
USING (auth.uid() = user_id);

-- Team leads and admins can view all learning insights
CREATE POLICY "Leads and admins can view all learning insights"
ON public.learning_insights
FOR SELECT
USING (
  has_role(auth.uid(), 'team_lead'::app_role) OR
  has_role(auth.uid(), 'report_admin'::app_role) OR
  has_role(auth.uid(), 'general_overseer'::app_role)
);

-- System/Reviewers can insert learning insights
CREATE POLICY "System can insert learning insights"
ON public.learning_insights
FOR INSERT
WITH CHECK (true);

-- 4. FINANCIAL NARRATIVES TABLE
-- Human-readable explanations for each financial period
CREATE TABLE IF NOT EXISTS public.financial_narratives (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_period_id uuid REFERENCES public.mpcn_financials(id) ON DELETE CASCADE,
  period_summary text NOT NULL,
  primary_drivers text[] NOT NULL DEFAULT '{}',
  negative_drivers text[] DEFAULT '{}',
  adjustment_notes text,
  workforce_impact text,
  next_period_outlook text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on financial_narratives
ALTER TABLE public.financial_narratives ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view financial narratives (transparency)
CREATE POLICY "Authenticated users can view financial narratives"
ON public.financial_narratives
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Investment admins and overseer can manage narratives
CREATE POLICY "Investment admins can manage financial narratives"
ON public.financial_narratives
FOR ALL
USING (
  has_role(auth.uid(), 'investment_admin'::app_role) OR
  has_role(auth.uid(), 'general_overseer'::app_role)
);

-- 5. COLLABORATION CONTRIBUTIONS TABLE
-- Track individual contributions in shared tasks
CREATE TABLE IF NOT EXISTS public.task_contributions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  contribution_weight numeric NOT NULL DEFAULT 1.0 CHECK (contribution_weight >= 0 AND contribution_weight <= 1),
  contribution_notes text,
  verified_by uuid,
  verified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on task_contributions
ALTER TABLE public.task_contributions ENABLE ROW LEVEL SECURITY;

-- Users can view their own contributions
CREATE POLICY "Users can view own contributions"
ON public.task_contributions
FOR SELECT
USING (auth.uid() = user_id);

-- Team leads and admins can view all contributions
CREATE POLICY "Leads and admins can view all contributions"
ON public.task_contributions
FOR SELECT
USING (
  has_role(auth.uid(), 'team_lead'::app_role) OR
  has_role(auth.uid(), 'report_admin'::app_role) OR
  has_role(auth.uid(), 'general_overseer'::app_role)
);

-- Team leads and admins can manage contributions
CREATE POLICY "Leads and admins can manage contributions"
ON public.task_contributions
FOR ALL
USING (
  has_role(auth.uid(), 'team_lead'::app_role) OR
  has_role(auth.uid(), 'report_admin'::app_role) OR
  has_role(auth.uid(), 'general_overseer'::app_role)
);

-- 6. SCALE GOVERNANCE - Add jurisdiction and locale to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS jurisdiction text,
ADD COLUMN IF NOT EXISTS currency_preference text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS dispute_sla_tier text DEFAULT 'standard' CHECK (dispute_sla_tier IN ('standard', 'priority', 'enterprise'));

-- 7. Add shared_task flag to tasks
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS is_shared boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS outcome_evaluation text;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leadership_signals_user_period 
ON public.leadership_signals(user_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_learning_insights_user 
ON public.learning_insights(user_id);

CREATE INDEX IF NOT EXISTS idx_learning_insights_entity 
ON public.learning_insights(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_financial_narratives_period 
ON public.financial_narratives(financial_period_id);

CREATE INDEX IF NOT EXISTS idx_task_contributions_task 
ON public.task_contributions(task_id);

CREATE INDEX IF NOT EXISTS idx_task_contributions_user 
ON public.task_contributions(user_id);