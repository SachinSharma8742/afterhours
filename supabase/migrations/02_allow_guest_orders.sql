-- ============================================================
-- MIGRATION 02: Allow Guest Orders (Nullable user_id)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Allow guest orders: make user_id nullable in orders table
ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL;

-- Allow guest tickets: make user_id nullable in tickets table
ALTER TABLE public.tickets
  ALTER COLUMN user_id DROP NOT NULL;

-- Allow tickets without mandatory ticket_type_id FK
ALTER TABLE public.tickets
  ALTER COLUMN ticket_type_id DROP NOT NULL;

-- Allow guest QR codes: make user_id nullable in qr_codes table
ALTER TABLE public.qr_codes
  ALTER COLUMN user_id DROP NOT NULL;

-- Allow attendance logs without mandatory qr_code_id (we may log without it)
ALTER TABLE public.attendance_logs
  ALTER COLUMN qr_code_id DROP NOT NULL;

-- Add scanned_at column to tickets if it doesn't exist
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS scanned_at TIMESTAMPTZ;

-- Add payment_id to orders for Razorpay reference
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_provider_id TEXT;

-- ============================================================
-- RLS POLICIES: Allow anon/service role to insert orders
-- ============================================================

-- Disable RLS on critical tables so service_role can always write
-- (service_role bypasses RLS anyway, but this ensures anon inserts work too)

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies first
DROP POLICY IF EXISTS "Allow service role full access on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow service role full access on tickets" ON public.tickets;
DROP POLICY IF EXISTS "Allow service role full access on qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Allow service role full access on attendance_logs" ON public.attendance_logs;

-- Service role bypass policies (service_role always bypasses RLS, these are for anon reads)
CREATE POLICY "Allow anon insert orders" ON public.orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anon insert tickets" ON public.tickets
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anon insert qr_codes" ON public.qr_codes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anon select tickets" ON public.tickets
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow anon select qr_codes" ON public.qr_codes
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow anon select orders" ON public.orders
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow anon update tickets" ON public.tickets
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon insert attendance_logs" ON public.attendance_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anon select attendance_logs" ON public.attendance_logs
  FOR SELECT TO anon, authenticated USING (true);
