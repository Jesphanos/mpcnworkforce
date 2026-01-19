-- MPCN Role Authority System - Step 2: Update functions for new roles
-- Updates role tier functions to include trader and department_head

-- Update get_role_tier to include new roles
DROP FUNCTION IF EXISTS public.get_role_tier(app_role);
CREATE OR REPLACE FUNCTION public.get_role_tier(role_name app_role)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE role_name
    WHEN 'general_overseer' THEN 0  -- Tier 0: Supreme Authority (Protected)
    WHEN 'user_admin' THEN 1        -- Tier 1: Administrators
    WHEN 'finance_hr_admin' THEN 1
    WHEN 'investment_admin' THEN 1
    WHEN 'report_admin' THEN 1
    WHEN 'department_head' THEN 2   -- Tier 2: Management
    WHEN 'team_lead' THEN 2
    WHEN 'trader' THEN 3            -- Tier 3: Operational
    WHEN 'employee' THEN 3
    ELSE 4
  END;
$$;

-- Update get_user_role to include new roles in priority order
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'general_overseer' THEN 1
      WHEN 'user_admin' THEN 2
      WHEN 'investment_admin' THEN 3
      WHEN 'finance_hr_admin' THEN 4
      WHEN 'report_admin' THEN 5
      WHEN 'department_head' THEN 6
      WHEN 'team_lead' THEN 7
      WHEN 'trader' THEN 8
      WHEN 'employee' THEN 9
    END
  LIMIT 1
$$;

-- Update get_role_level to include new roles
DROP FUNCTION IF EXISTS public.get_role_level(app_role);
CREATE OR REPLACE FUNCTION public.get_role_level(role_name app_role)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE role_name
    WHEN 'general_overseer' THEN 1
    WHEN 'user_admin' THEN 2
    WHEN 'investment_admin' THEN 3
    WHEN 'finance_hr_admin' THEN 4
    WHEN 'report_admin' THEN 5
    WHEN 'department_head' THEN 6
    WHEN 'team_lead' THEN 7
    WHEN 'trader' THEN 8
    WHEN 'employee' THEN 9
  END
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_role_tier(app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_role_level(app_role) TO authenticated;