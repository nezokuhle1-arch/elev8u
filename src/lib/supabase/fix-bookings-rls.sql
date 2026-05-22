-- Allow clients to create bookings and mark leads completed after Cal.com booking.
-- Run in Supabase SQL Editor after fix-leads-rls.sql

CREATE POLICY "Clients can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = client_id);
