-- Create platform_settings table for configurable platforms and rates
CREATE TABLE public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  base_rate NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_settings table for general preferences
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for platform_settings
CREATE POLICY "Authenticated users can view active platforms"
ON public.platform_settings
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "General Overseer can view all platforms"
ON public.platform_settings
FOR SELECT
USING (has_role(auth.uid(), 'general_overseer'::app_role));

CREATE POLICY "General Overseer can manage platforms"
ON public.platform_settings
FOR ALL
USING (has_role(auth.uid(), 'general_overseer'::app_role));

-- RLS policies for system_settings
CREATE POLICY "Authenticated users can view system settings"
ON public.system_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "General Overseer can manage system settings"
ON public.system_settings
FOR ALL
USING (has_role(auth.uid(), 'general_overseer'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default platforms
INSERT INTO public.platform_settings (name, base_rate, color) VALUES
('Upwork', 15.00, '#14A800'),
('Fiverr', 12.00, '#1DBF73'),
('Swagbucks', 8.00, '#0078D7'),
('Trading', 20.00, '#F59E0B'),
('Freelancer', 10.00, '#29B2FE'),
('Other', 10.00, '#6B7280');

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
('default_hours_per_day', '{"value": 8}', 'Default working hours per day'),
('currency', '{"code": "USD", "symbol": "$"}', 'System currency settings'),
('approval_workflow', '{"require_team_lead": true, "require_admin": true}', 'Approval workflow configuration'),
('notifications', '{"email_enabled": true, "in_app_enabled": true}', 'Notification preferences');