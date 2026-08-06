const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.fpynhxfjgppqfpvmyikd:postgres@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
  });

  try {
    await client.connect();
    
    const sql = `
-- Fix the trigger that crashes on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'customer'::user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable service_role to manage users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access users" ON public.users;
CREATE POLICY "Service role full access users" ON public.users
  FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Make sure user_id is nullable everywhere (from previous fix)
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.tickets ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.tickets ALTER COLUMN ticket_type_id DROP NOT NULL;
ALTER TABLE public.qr_codes ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.attendance_logs ALTER COLUMN qr_code_id DROP NOT NULL;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS scanned_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_provider_id TEXT;

-- Enable RLS and permissive insert policies for guest checkout
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon insert tickets" ON public.tickets;
DROP POLICY IF EXISTS "Allow anon insert qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Allow anon select tickets" ON public.tickets;
DROP POLICY IF EXISTS "Allow anon select qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Allow anon select orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon update tickets" ON public.tickets;
DROP POLICY IF EXISTS "Allow anon insert attendance_logs" ON public.attendance_logs;
DROP POLICY IF EXISTS "Allow anon select attendance_logs" ON public.attendance_logs;

CREATE POLICY "Allow anon insert orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon insert tickets" ON public.tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon insert qr_codes" ON public.qr_codes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon select tickets" ON public.tickets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon select qr_codes" ON public.qr_codes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon select orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon update tickets" ON public.tickets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon insert attendance_logs" ON public.attendance_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon select attendance_logs" ON public.attendance_logs FOR SELECT TO anon, authenticated USING (true);

-- Insert the Official Event for Checkout (using the fixed UUIDs so foreign keys work)
INSERT INTO public.organizers (id, company_name, bio, verified)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'AfterHours Management',
  'Official Event Management & Production Host',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (
  id,
  organizer_id,
  title,
  slug,
  short_description,
  full_description,
  banner_url,
  venue_name,
  venue_address,
  city,
  start_date,
  end_date,
  is_featured,
  is_published,
  status,
  total_capacity
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Freshers Party 2026',
  'freshers-party-2026',
  'Welcome to the Biggest Freshers Celebration in Jaipur! An unforgettable night of music, fun, and memories.',
  'Get ready for an unforgettable night of music...',
  '/images/event.jpeg',
  'The Royal Palm',
  'Jagatpura, Jaipur',
  'Jaipur',
  '2026-08-16T18:00:00+05:30',
  '2026-08-16T22:30:00+05:30',
  true,
  true,
  'published',
  800
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO public.ticket_types (id, event_id, name, description, price, quantity_total, quantity_sold, is_active)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '♂ Boys Pass', 'Valid entry pass for 1 male attendee (18+).', 999.00, 300, 0, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '♀ Girls Pass', 'Valid entry pass for 1 female attendee (18+).', 299.00, 300, 0, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '⚢ Couple Pass', 'Valid entry pass for 1 couple (18+).', 499.00, 200, 0, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Enable RLS and select policy for coupon_codes
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon select coupon_codes" ON public.coupon_codes;
CREATE POLICY "Allow anon select coupon_codes" ON public.coupon_codes FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.coupon_codes (code, discount_type, discount_value, is_active)
VALUES
  ('RANDI', 'override', 10.00, true),
  ('FRIEND', 'fixed', 200.00, true)
ON CONFLICT (code) DO UPDATE SET discount_value = EXCLUDED.discount_value, is_active = true;
    `;
    
    await client.query(sql);
    console.log("SQL executed successfully!");
    
  } catch (err) {
    console.error("SQL Error:", err);
  } finally {
    await client.end();
  }
}

run();
