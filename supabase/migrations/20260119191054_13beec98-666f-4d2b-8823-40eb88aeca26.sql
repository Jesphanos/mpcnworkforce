-- MPCN Role Authority System - Step 1: Add new roles to enum
-- Note: trader and department_head will be usable after this migration commits
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'trader';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'department_head';