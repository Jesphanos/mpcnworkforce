-- Add skills/expertise to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_investor boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS initial_investment numeric DEFAULT 0;

-- Create complaints table
CREATE TABLE public.complaints (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  attachment_url text,
  status text NOT NULL DEFAULT 'pending',
  escalated boolean DEFAULT false,
  escalated_at timestamp with time zone,
  assigned_to uuid REFERENCES auth.users(id),
  resolved_at timestamp with time zone,
  resolved_by uuid REFERENCES auth.users(id),
  resolution_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Employees can view their own complaints
CREATE POLICY "Users can view their own complaints"
ON public.complaints
FOR SELECT
USING (auth.uid() = user_id);

-- Employees can create their own complaints
CREATE POLICY "Users can create their own complaints"
ON public.complaints
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Team leads and admins can view all complaints
CREATE POLICY "Team leads and admins can view complaints"
ON public.complaints
FOR SELECT
USING (
  has_role(auth.uid(), 'team_lead') OR 
  has_role(auth.uid(), 'report_admin') OR 
  has_role(auth.uid(), 'general_overseer')
);

-- Team leads and admins can update complaints
CREATE POLICY "Team leads and admins can update complaints"
ON public.complaints
FOR UPDATE
USING (
  has_role(auth.uid(), 'team_lead') OR 
  has_role(auth.uid(), 'report_admin') OR 
  has_role(auth.uid(), 'general_overseer')
);

-- Create referrals table
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (as referrer)
CREATE POLICY "Users can view their referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id);

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
ON public.referrals
FOR SELECT
USING (
  has_role(auth.uid(), 'user_admin') OR 
  has_role(auth.uid(), 'general_overseer')
);

-- Admins can manage referrals
CREATE POLICY "Admins can manage referrals"
ON public.referrals
FOR ALL
USING (
  has_role(auth.uid(), 'user_admin') OR 
  has_role(auth.uid(), 'general_overseer')
);

-- System can insert referrals
CREATE POLICY "System can insert referrals"
ON public.referrals
FOR INSERT
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add referral_code to profiles for tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES auth.users(id);