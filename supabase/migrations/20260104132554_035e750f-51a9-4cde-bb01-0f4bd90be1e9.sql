-- Add task_type enum
CREATE TYPE public.task_type AS ENUM (
  'research',
  'coding',
  'design',
  'support',
  'writing',
  'data_entry',
  'quality_assurance',
  'project_management',
  'other'
);

-- Add new fields to tasks table for comprehensive tracking
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS external_task_id text,
ADD COLUMN IF NOT EXISTS task_type public.task_type DEFAULT 'other',
ADD COLUMN IF NOT EXISTS assigned_by uuid,
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS estimated_hours numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress_percent integer DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
ADD COLUMN IF NOT EXISTS evidence_url text,
ADD COLUMN IF NOT EXISTS evidence_required boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS collaborators uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS revisions_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating numeric CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS feedback_notes text,
ADD COLUMN IF NOT EXISTS bonuses numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS investment_contribution numeric DEFAULT 0;

-- Add new fields to work_reports table for parity
ALTER TABLE public.work_reports
ADD COLUMN IF NOT EXISTS external_task_id text,
ADD COLUMN IF NOT EXISTS task_type public.task_type DEFAULT 'other',
ADD COLUMN IF NOT EXISTS assigned_by uuid,
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS estimated_hours numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress_percent integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS evidence_url text,
ADD COLUMN IF NOT EXISTS evidence_required boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS collaborators uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS revisions_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating numeric CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS feedback_notes text,
ADD COLUMN IF NOT EXISTS bonuses numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS investment_contribution numeric DEFAULT 0;

-- Create external_accounts table for better structured data
CREATE TABLE IF NOT EXISTS public.external_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_name text NOT NULL,
  external_username text NOT NULL,
  profile_link text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'verified')),
  verified_by uuid,
  verified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform_name)
);

-- Enable RLS on external_accounts
ALTER TABLE public.external_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own external accounts
CREATE POLICY "Users can view their own external accounts"
ON public.external_accounts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can manage their own external accounts
CREATE POLICY "Users can manage their own external accounts"
ON public.external_accounts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view and verify all external accounts
CREATE POLICY "Admins can view all external accounts"
ON public.external_accounts
FOR SELECT
USING (
  has_role(auth.uid(), 'user_admin'::app_role) OR 
  has_role(auth.uid(), 'general_overseer'::app_role)
);

CREATE POLICY "Admins can update external accounts for verification"
ON public.external_accounts
FOR UPDATE
USING (
  has_role(auth.uid(), 'user_admin'::app_role) OR 
  has_role(auth.uid(), 'general_overseer'::app_role)
);

-- Create trigger for updated_at on external_accounts
CREATE TRIGGER update_external_accounts_updated_at
  BEFORE UPDATE ON public.external_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_external_accounts_user_id ON public.external_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON public.tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_work_reports_assigned_by ON public.work_reports(assigned_by);