-- Fix leads/bookings RLS so freelancers can see leads matched to their profile.
-- Run this in the Supabase SQL Editor.
--
-- Bug: leads.freelancer_id references freelancer_profiles.id, but the old policy
-- compared auth.uid() to profiles.id where profiles.id = freelancer_id (never true).

DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Freelancers can update their own leads" ON public.leads;

CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT USING (
    auth.uid() = client_id
    OR auth.uid() IN (
      SELECT user_id FROM public.freelancer_profiles
      WHERE id = freelancer_id
    )
  );

CREATE POLICY "Freelancers can update their own leads"
  ON public.leads FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.freelancer_profiles
      WHERE id = freelancer_id
    )
  );

DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT USING (
    auth.uid() = client_id
    OR auth.uid() IN (
      SELECT user_id FROM public.freelancer_profiles
      WHERE id = freelancer_id
    )
  );
