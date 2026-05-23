-- Admin role and vetting policies for Elev8U
-- Run in the Supabase SQL Editor

-- Add admin role to profiles table check constraint
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('freelancer', 'client', 'admin'));

-- Track when a profile was approved (for "Approved today" stat)
ALTER TABLE public.freelancer_profiles
  ADD COLUMN IF NOT EXISTS vetted_at timestamp with time zone;

-- Admin RLS policies
-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Admins can update any freelancer_profile
CREATE POLICY "Admins can update any freelancer profile"
  ON public.freelancer_profiles FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Admins can delete any freelancer_profile (reject flow)
CREATE POLICY "Admins can delete any freelancer profile"
  ON public.freelancer_profiles FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );
