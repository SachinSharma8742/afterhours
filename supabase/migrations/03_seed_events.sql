-- ============================================================
-- SEED: Insert AfterHours official events into Supabase
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Create a system organizer (no user_id needed, use a fixed UUID)
INSERT INTO public.organizers (id, user_id, company_name, bio, verified)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  NULL,  -- will be set below after making user_id nullable
  'AfterHours Management',
  'Official Event Management & Production Host',
  true
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  verified = EXCLUDED.verified;

-- Step 2: Insert the Freshers Party 2026 event with a fixed UUID
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
  'Welcome to the Biggest Freshers Celebration in Jaipur! An unforgettable night of music, fun, and memories at The Royal Palm, Jagatpura.',
  'Welcome to the Biggest Freshers Celebration in Jaipur! Get ready for an unforgettable night of music, fun, and memories. DJ Night, Mr & Miss Freshers, Speed Friending, Dance Performances, Photo Booth and more!',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80',
  'The Royal Palm',
  'Jagatpura, Jaipur',
  'Jaipur',
  '2026-08-16T18:00:00+05:30',
  '2026-08-16T22:30:00+05:30',
  true,
  true,
  'published',
  800
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  is_published = EXCLUDED.is_published;

-- Step 3: Insert ticket types with fixed UUIDs
INSERT INTO public.ticket_types (id, event_id, name, description, price, quantity_total, quantity_sold, is_active)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    '👨 Boys Pass',
    'Valid entry pass for 1 male attendee (16+). Includes entry to all event activities and the DJ Night.',
    999.00,
    300,
    0,
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    '👩 Girls Pass',
    'Valid entry pass for 1 female attendee (16+). Includes entry to all event activities and the DJ Night.',
    299.00,
    300,
    0,
    true
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    '💑 Couple Pass',
    'Valid entry pass for 1 couple (16+). Includes entry to all event activities and the DJ Night for both.',
    499.00,
    200,
    0,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  is_active = EXCLUDED.is_active;
