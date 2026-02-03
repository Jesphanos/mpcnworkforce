-- Add system settings for content management and feature access
-- These enable the General Overseer to manage content and page access

INSERT INTO public.system_settings (key, value, description)
VALUES 
  ('governance_charter', '{}', 'Custom overrides for the governance charter content'),
  ('mpcn_learn_overrides', '{}', 'Custom overrides for MPCN Learn module content'),
  ('feature_access', '{"disabled_routes": {"trading": [], "investments": [], "reports": [], "tasks": [], "team": [], "finance_hr": [], "governance": [], "users": [], "activity": [], "learn": []}}', 'Role-based route access controls')
ON CONFLICT (key) DO NOTHING;