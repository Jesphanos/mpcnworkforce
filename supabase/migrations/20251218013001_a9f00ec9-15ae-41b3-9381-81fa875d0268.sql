-- Create table for pending general_overseer role requests
CREATE TABLE public.pending_role_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  requested_role app_role NOT NULL DEFAULT 'general_overseer',
  approval_token uuid NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  requester_email text NOT NULL,
  target_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  processed_at timestamptz,
  UNIQUE(approval_token)
);

-- Enable RLS
ALTER TABLE public.pending_role_approvals ENABLE ROW LEVEL SECURITY;

-- Only admins can view pending approvals
CREATE POLICY "Admins can view pending approvals"
ON public.pending_role_approvals
FOR SELECT
USING (has_role(auth.uid(), 'user_admin') OR has_role(auth.uid(), 'general_overseer'));

-- Only admins can create pending approvals
CREATE POLICY "Admins can create pending approvals"
ON public.pending_role_approvals
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'user_admin') OR has_role(auth.uid(), 'general_overseer'));

-- Create function to get current general_overseer email
CREATE OR REPLACE FUNCTION public.get_general_overseer_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email
  FROM auth.users u
  INNER JOIN public.user_roles ur ON u.id = ur.user_id
  WHERE ur.role = 'general_overseer'
  LIMIT 1
$$;