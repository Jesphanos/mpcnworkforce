-- Add phone number column to profiles for international users
ALTER TABLE public.profiles
ADD COLUMN phone_number text;

-- Add index for phone lookup
CREATE INDEX idx_profiles_phone ON public.profiles(phone_number) WHERE phone_number IS NOT NULL;