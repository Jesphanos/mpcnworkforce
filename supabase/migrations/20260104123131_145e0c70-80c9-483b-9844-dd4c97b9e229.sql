-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members junction table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Authenticated users can view teams"
ON public.teams FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Team leads and admins can manage teams"
ON public.teams FOR ALL
USING (
  has_role(auth.uid(), 'team_lead'::app_role) OR 
  has_role(auth.uid(), 'user_admin'::app_role) OR 
  has_role(auth.uid(), 'general_overseer'::app_role)
);

-- Team members policies
CREATE POLICY "Users can view their own team membership"
ON public.team_members FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Team leads and admins can view all memberships"
ON public.team_members FOR SELECT
USING (
  has_role(auth.uid(), 'team_lead'::app_role) OR 
  has_role(auth.uid(), 'user_admin'::app_role) OR 
  has_role(auth.uid(), 'general_overseer'::app_role)
);

CREATE POLICY "Team leads and admins can manage memberships"
ON public.team_members FOR ALL
USING (
  has_role(auth.uid(), 'team_lead'::app_role) OR 
  has_role(auth.uid(), 'user_admin'::app_role) OR 
  has_role(auth.uid(), 'general_overseer'::app_role)
);

-- Update triggers
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
