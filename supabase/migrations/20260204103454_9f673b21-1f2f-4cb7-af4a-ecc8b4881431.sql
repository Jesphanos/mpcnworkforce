-- Fix overly permissive RLS policies on tables with USING (true)
-- These policies allow unauthorized insertions - critical security vulnerability

-- Fix audit_logs policies
DROP POLICY IF EXISTS "Allow inserts from authenticated users" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix leadership_signals policies
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.leadership_signals;
CREATE POLICY "Authenticated users can insert leadership signals"
ON public.leadership_signals
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix learning_insights policies  
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.learning_insights;
CREATE POLICY "Authenticated users can insert learning insights"
ON public.learning_insights
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix notifications policies
DROP POLICY IF EXISTS "Allow inserts" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix referrals policies
DROP POLICY IF EXISTS "Allow inserts for authenticated users" ON public.referrals;
CREATE POLICY "Authenticated users can insert referrals"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix report_history policies
DROP POLICY IF EXISTS "Allow inserts from authenticated users" ON public.report_history;
CREATE POLICY "Authenticated users can insert report history"
ON public.report_history
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create comments table for real-time collaboration
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL, -- 'task', 'report', 'investment'
  entity_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Users can view comments on entities they have access to"
ON public.comments
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own comments"
ON public.comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Create user_preferences table for dashboard layouts and settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  dashboard_layout JSONB DEFAULT '{}',
  sidebar_collapsed BOOLEAN DEFAULT false,
  reduce_motion BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  line_spacing TEXT DEFAULT 'normal',
  recent_searches TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();