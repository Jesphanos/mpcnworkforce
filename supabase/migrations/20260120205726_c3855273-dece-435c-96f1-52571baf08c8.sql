-- Create learning progress tracking table
CREATE TABLE public.learning_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    module_group TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, module_id)
);

-- Create certificates table
CREATE TABLE public.learning_certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    certificate_type TEXT NOT NULL,
    certificate_name TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    issued_by UUID REFERENCES auth.users(id),
    modules_completed TEXT[] NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, certificate_type)
);

-- Add certification fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS learning_path TEXT,
ADD COLUMN IF NOT EXISTS learning_started_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_progress
-- Users can view their own progress
CREATE POLICY "Users can view own learning progress"
ON public.learning_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can create own learning progress"
ON public.learning_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own learning progress"
ON public.learning_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins and overseers can view all progress
CREATE POLICY "Admins can view all learning progress"
ON public.learning_progress
FOR SELECT
USING (
    public.has_role(auth.uid(), 'general_overseer') OR
    public.has_role(auth.uid(), 'user_admin') OR
    public.has_role(auth.uid(), 'finance_hr_admin')
);

-- RLS Policies for learning_certificates
-- Users can view their own certificates
CREATE POLICY "Users can view own certificates"
ON public.learning_certificates
FOR SELECT
USING (auth.uid() = user_id);

-- Only system can issue certificates (via security definer function)
CREATE POLICY "Admins can manage certificates"
ON public.learning_certificates
FOR ALL
USING (
    public.has_role(auth.uid(), 'general_overseer') OR
    public.has_role(auth.uid(), 'user_admin')
);

-- Create function to issue certificate
CREATE OR REPLACE FUNCTION public.issue_learning_certificate(
    p_user_id UUID,
    p_certificate_type TEXT,
    p_certificate_name TEXT,
    p_modules_completed TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cert_id UUID;
BEGIN
    -- Insert certificate
    INSERT INTO public.learning_certificates (
        user_id, certificate_type, certificate_name, 
        modules_completed, issued_by
    )
    VALUES (
        p_user_id, p_certificate_type, p_certificate_name,
        p_modules_completed, auth.uid()
    )
    ON CONFLICT (user_id, certificate_type) 
    DO UPDATE SET 
        modules_completed = EXCLUDED.modules_completed,
        issued_at = now(),
        issued_by = auth.uid()
    RETURNING id INTO v_cert_id;
    
    -- Update profile certifications
    UPDATE public.profiles
    SET certifications = array_append(
        COALESCE(certifications, '{}'),
        p_certificate_type
    )
    WHERE id = p_user_id
    AND NOT (p_certificate_type = ANY(COALESCE(certifications, '{}')));
    
    -- Log the certificate issuance
    PERFORM log_audit_event(
        'learning_certificate',
        v_cert_id,
        'certificate_issued',
        auth.uid(),
        NULL,
        jsonb_build_object(
            'certificate_type', p_certificate_type,
            'certificate_name', p_certificate_name,
            'modules_completed', p_modules_completed
        ),
        'Certificate issued for completing learning path'
    );
    
    RETURN v_cert_id;
END;
$$;

-- Create function to check certification eligibility
CREATE OR REPLACE FUNCTION public.check_certification_eligibility(
    p_user_id UUID,
    p_certificate_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_required_modules TEXT[];
    v_completed_count INTEGER;
BEGIN
    -- Define required modules for each certificate type
    v_required_modules := CASE p_certificate_type
        WHEN 'foundations' THEN ARRAY['A1', 'A2', 'A3', 'A4']
        WHEN 'risk_protection' THEN ARRAY['C1', 'C2']
        WHEN 'stewardship' THEN ARRAY['E1', 'E2', 'E3']
        WHEN 'skilled_worker' THEN ARRAY['A1', 'A2', 'A3', 'A4', 'B1', 'C1', 'C2']
        WHEN 'trader' THEN ARRAY['A1', 'A2', 'A4', 'B1', 'C1', 'C2']
        WHEN 'team_lead' THEN ARRAY['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'C1', 'C2']
        ELSE ARRAY[]::TEXT[]
    END;
    
    -- Count completed required modules
    SELECT COUNT(*) INTO v_completed_count
    FROM public.learning_progress
    WHERE user_id = p_user_id
    AND module_id = ANY(v_required_modules)
    AND completed_at IS NOT NULL;
    
    RETURN v_completed_count >= array_length(v_required_modules, 1);
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_learning_progress_updated_at
BEFORE UPDATE ON public.learning_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for learning progress
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_certificates;