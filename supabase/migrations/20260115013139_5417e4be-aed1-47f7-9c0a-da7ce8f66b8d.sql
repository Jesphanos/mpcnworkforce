-- =============================================
-- MPCN GOVERNANCE ENFORCEMENT MIGRATION
-- Enforces role tiers, single team membership, and audit requirements
-- =============================================

-- 1. Add transfer tracking fields to team_members
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS transfer_reason TEXT,
ADD COLUMN IF NOT EXISTS transferred_from_team UUID REFERENCES public.teams(id),
ADD COLUMN IF NOT EXISTS transferred_at TIMESTAMP WITH TIME ZONE;

-- 2. Create a function to get role tier
CREATE OR REPLACE FUNCTION public.get_role_tier(role_name public.app_role)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE role_name
    WHEN 'general_overseer' THEN 0  -- Tier 0: Protected, immutable
    WHEN 'user_admin' THEN 1        -- Tier 1: Admin level
    WHEN 'finance_hr_admin' THEN 1
    WHEN 'investment_admin' THEN 1
    WHEN 'report_admin' THEN 1
    WHEN 'team_lead' THEN 2         -- Tier 2: Worker level
    WHEN 'employee' THEN 2
    ELSE 3
  END;
$$;

-- 3. Create function to check if user can modify another user's role
CREATE OR REPLACE FUNCTION public.can_modify_role(
  actor_id UUID,
  target_id UUID,
  target_current_role public.app_role,
  new_role public.app_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_role public.app_role;
  actor_tier INTEGER;
  target_tier INTEGER;
  new_tier INTEGER;
BEGIN
  -- Get actor's role
  SELECT role INTO actor_role FROM public.user_roles WHERE user_id = actor_id;
  
  -- Actors cannot modify themselves
  IF actor_id = target_id THEN
    RETURN false;
  END IF;
  
  -- Get role tiers
  actor_tier := get_role_tier(actor_role);
  target_tier := get_role_tier(target_current_role);
  new_tier := get_role_tier(new_role);
  
  -- Tier 0 (General Overseer) cannot be demoted or deleted by anyone via normal means
  IF target_tier = 0 THEN
    RETURN false;
  END IF;
  
  -- General Overseer (Tier 0) can modify any lower tier
  IF actor_tier = 0 THEN
    RETURN true;
  END IF;
  
  -- Admins (Tier 1) cannot modify peer admins
  IF actor_tier = 1 AND target_tier <= 1 THEN
    RETURN false;
  END IF;
  
  -- Admins cannot promote to Tier 0
  IF new_tier = 0 THEN
    RETURN false; -- Requires special approval flow
  END IF;
  
  -- Admins can manage Tier 2 and assign to Tier 1 or 2
  IF actor_tier = 1 AND target_tier > 1 THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 4. Create function to check if user can be deleted
CREATE OR REPLACE FUNCTION public.can_delete_user(actor_id UUID, target_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_role public.app_role;
  target_role public.app_role;
BEGIN
  -- Get roles
  SELECT role INTO actor_role FROM public.user_roles WHERE user_id = actor_id;
  SELECT role INTO target_role FROM public.user_roles WHERE user_id = target_id;
  
  -- Cannot delete self
  IF actor_id = target_id THEN
    RETURN false;
  END IF;
  
  -- General Overseer cannot be deleted
  IF target_role = 'general_overseer' THEN
    RETURN false;
  END IF;
  
  -- Only General Overseer can delete admins
  IF get_role_tier(target_role) = 1 AND get_role_tier(actor_role) != 0 THEN
    RETURN false;
  END IF;
  
  -- General Overseer and User Admin can delete lower tier users
  IF actor_role IN ('general_overseer', 'user_admin') THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 5. Create function to enforce single active team membership on transfer
CREATE OR REPLACE FUNCTION public.transfer_team_membership(
  p_user_id UUID,
  p_new_team_id UUID,
  p_transfer_reason TEXT,
  p_transferred_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_team_id UUID;
  v_new_membership_id UUID;
BEGIN
  -- Find and deactivate current active membership
  UPDATE public.team_members 
  SET 
    is_active = false,
    transferred_at = now()
  WHERE user_id = p_user_id AND is_active = true
  RETURNING team_id INTO v_old_team_id;
  
  -- Create new active membership
  INSERT INTO public.team_members (
    team_id, 
    user_id, 
    role, 
    assigned_by, 
    is_active,
    transfer_reason,
    transferred_from_team
  )
  VALUES (
    p_new_team_id,
    p_user_id,
    'member',
    p_transferred_by,
    true,
    p_transfer_reason,
    v_old_team_id
  )
  RETURNING id INTO v_new_membership_id;
  
  -- Log the transfer in audit_logs
  INSERT INTO public.audit_logs (
    action,
    entity_type,
    entity_id,
    performed_by,
    previous_values,
    new_values,
    notes
  ) VALUES (
    'team_transfer',
    'team_member',
    v_new_membership_id::text,
    p_transferred_by,
    jsonb_build_object('team_id', v_old_team_id),
    jsonb_build_object('team_id', p_new_team_id),
    p_transfer_reason
  );
  
  RETURN v_new_membership_id;
END;
$$;

-- 6. Create function to log role changes with mandatory reason
CREATE OR REPLACE FUNCTION public.change_user_role_with_audit(
  p_actor_id UUID,
  p_target_user_id UUID,
  p_new_role public.app_role,
  p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_role public.app_role;
  v_role_id UUID;
BEGIN
  -- Get current role
  SELECT role, id INTO v_old_role, v_role_id 
  FROM public.user_roles 
  WHERE user_id = p_target_user_id;
  
  -- Check if actor can modify this role
  IF NOT can_modify_role(p_actor_id, p_target_user_id, COALESCE(v_old_role, 'employee'), p_new_role) THEN
    RAISE EXCEPTION 'Insufficient authority to modify this role';
  END IF;
  
  -- Update or insert role
  IF v_role_id IS NOT NULL THEN
    UPDATE public.user_roles SET role = p_new_role WHERE id = v_role_id;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (p_target_user_id, p_new_role);
  END IF;
  
  -- Log the change
  INSERT INTO public.audit_logs (
    action,
    entity_type,
    entity_id,
    performed_by,
    previous_values,
    new_values,
    notes
  ) VALUES (
    'role_change',
    'user_role',
    p_target_user_id::text,
    p_actor_id,
    jsonb_build_object('role', v_old_role),
    jsonb_build_object('role', p_new_role),
    p_reason
  );
  
  RETURN true;
END;
$$;

-- 7. Create index for active team membership lookups
CREATE INDEX IF NOT EXISTS idx_team_members_active 
ON public.team_members (user_id, is_active) 
WHERE is_active = true;