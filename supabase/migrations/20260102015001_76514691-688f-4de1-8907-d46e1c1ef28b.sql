-- Create work_reports table for tracking employee reports
CREATE TABLE public.work_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  work_date DATE NOT NULL,
  hours_worked DECIMAL(5,2) NOT NULL DEFAULT 0,
  earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create salary_periods table for managing pay periods
CREATE TABLE public.salary_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  closed_at TIMESTAMP WITH TIME ZONE,
  closed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investments table for tracking organization investments
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  investment_type TEXT NOT NULL,
  initial_amount DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2) NOT NULL,
  purchase_date DATE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'matured')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.work_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Work Reports RLS Policies
CREATE POLICY "Employees can view their own reports"
ON public.work_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Employees can create their own reports"
ON public.work_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees can update their pending reports"
ON public.work_reports FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Report admins can view all reports"
ON public.work_reports FOR SELECT
USING (has_role(auth.uid(), 'report_admin') OR has_role(auth.uid(), 'general_overseer'));

CREATE POLICY "Report admins can update reports"
ON public.work_reports FOR UPDATE
USING (has_role(auth.uid(), 'report_admin') OR has_role(auth.uid(), 'general_overseer'));

-- Salary Periods RLS Policies
CREATE POLICY "Finance admins can manage salary periods"
ON public.salary_periods FOR ALL
USING (has_role(auth.uid(), 'finance_hr_admin') OR has_role(auth.uid(), 'general_overseer'));

CREATE POLICY "Employees can view salary periods"
ON public.salary_periods FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Investments RLS Policies
CREATE POLICY "Investment admins can manage investments"
ON public.investments FOR ALL
USING (has_role(auth.uid(), 'investment_admin') OR has_role(auth.uid(), 'general_overseer'));

CREATE POLICY "Employees can view investments"
ON public.investments FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Update triggers
CREATE TRIGGER update_work_reports_updated_at
BEFORE UPDATE ON public.work_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salary_periods_updated_at
BEFORE UPDATE ON public.salary_periods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investments_updated_at
BEFORE UPDATE ON public.investments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();