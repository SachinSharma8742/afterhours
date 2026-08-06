-- ============================================================
-- AFTERHOURS EVENT MANAGEMENT PLATFORM SCHEMA
-- Production-Ready Migration
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums
CREATE TYPE user_role AS ENUM ('customer', 'organizer', 'admin');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'cancelled', 'refunded');
CREATE TYPE ticket_status AS ENUM ('valid', 'used', 'refunded', 'cancelled');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- 1. USERS (Profile extending Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role user_role DEFAULT 'customer'::user_role NOT NULL,
    is_suspended BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. ORGANIZERS
CREATE TABLE IF NOT EXISTS public.organizers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    company_name TEXT NOT NULL,
    bio TEXT,
    logo_url TEXT,
    website TEXT,
    phone TEXT,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    total_events INT DEFAULT 0 NOT NULL,
    rating NUMERIC(3,2) DEFAULT 5.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. EVENT CATEGORIES
CREATE TABLE IF NOT EXISTS public.event_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    full_description TEXT,
    banner_url TEXT,
    venue_name TEXT NOT NULL,
    venue_address TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    status event_status DEFAULT 'published'::event_status NOT NULL,
    cancellation_policy TEXT,
    total_capacity INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. EVENT IMAGES
CREATE TABLE IF NOT EXISTS public.event_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. TICKET TYPES
CREATE TABLE IF NOT EXISTS public.ticket_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    quantity_total INT NOT NULL CHECK (quantity_total >= 0),
    quantity_sold INT DEFAULT 0 NOT NULL CHECK (quantity_sold <= quantity_total),
    max_per_user INT DEFAULT 10 NOT NULL,
    sales_start TIMESTAMPTZ,
    sales_end TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. COUPON CODES
CREATE TABLE IF NOT EXISTS public.coupon_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE, -- NULL means platform-wide
    code TEXT NOT NULL UNIQUE,
    discount_type discount_type DEFAULT 'percentage'::discount_type NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    usage_limit INT DEFAULT 100 NOT NULL,
    times_used INT DEFAULT 0 NOT NULL,
    valid_from TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    final_amount NUMERIC(10, 2) NOT NULL,
    coupon_id UUID REFERENCES public.coupon_codes(id) ON DELETE SET NULL,
    status order_status DEFAULT 'pending'::order_status NOT NULL,
    attendee_name TEXT NOT NULL,
    attendee_email TEXT NOT NULL,
    attendee_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT DEFAULT 'stripe' NOT NULL,
    provider_transaction_id TEXT UNIQUE,
    status payment_status DEFAULT 'pending'::payment_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. TICKETS
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ticket_number TEXT UNIQUE NOT NULL,
    seat_number TEXT,
    status ticket_status DEFAULT 'valid'::ticket_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. QR CODES
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE UNIQUE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    qr_payload TEXT NOT NULL,
    qr_image_url TEXT,
    signature_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    is_invalidated BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. ATTENDANCE LOGS
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    scanned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    scanned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    scan_status TEXT DEFAULT 'success' NOT NULL,
    device_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    is_approved BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(event_id, user_id)
);

-- 14. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. WISHLIST
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, event_id)
);

-- 16. SAVED EVENTS
CREATE TABLE IF NOT EXISTS public.saved_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, event_id)
);

-- ============================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events(status, start_date);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON public.ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event ON public.events(id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_tickets_order ON public.tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON public.tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_qr_codes_ticket ON public.qr_codes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_signature ON public.qr_codes(signature_hash);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.attendance_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_ticket ON public.attendance_logs(ticket_id);

-- ============================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_organizers_modtime BEFORE UPDATE ON public.organizers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_events_modtime BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_ticket_types_modtime BEFORE UPDATE ON public.ticket_types FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_tickets_modtime BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Initial Categories Seed Data
INSERT INTO public.event_categories (name, slug, icon, description) VALUES
('Music & Concerts', 'music-concerts', 'Music', 'Live concerts, music festivals, and performances'),
('Tech & Innovation', 'tech-innovation', 'Cpu', 'Developer conferences, AI summits, and tech meetups'),
('Nightlife & Parties', 'nightlife-parties', 'Sparkles', 'Club nights, rooftop parties, and after-hours raves'),
('Arts & Theatre', 'arts-theatre', 'Palette', 'Art exhibitions, theatrical plays, and gallery shows'),
('Sports & Fitness', 'sports-fitness', 'Trophy', 'Tournaments, marathons, and fitness bootcamps'),
('Business & Networking', 'business-networking', 'Briefcase', 'Startup pitches, investor summits, and business expos')
ON CONFLICT (name) DO NOTHING;
