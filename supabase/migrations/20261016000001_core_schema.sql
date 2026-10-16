-- ==============================================================================
-- SPaC Booking Management System — Migration 01: Core Schema & Constraints
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE staff_role AS ENUM (
    'Owner',
    'Admin',
    'Manager',
    'Staff',
    'Cashier',
    'Court Attendant'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE account_status AS ENUM ('Active', 'Inactive');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'Pending Payment',
    'Reserved',
    'Confirmed',
    'In Progress',
    'Completed',
    'Cancelled',
    'No Show'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'Pending',
    'Paid',
    'Failed',
    'Refunded',
    'Cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'GCash',
    'Maya',
    'QR Ph',
    'Cash',
    'Bank Transfer'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_source AS ENUM (
    'Online / App',
    'Walk-in',
    'Phone',
    'Social Media'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE log_category AS ENUM (
    'Booking',
    'Payment',
    'Account',
    'Settings'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. COURTS & PHYSICAL RESOURCES
CREATE TABLE IF NOT EXISTS public.courts (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. STAFF PROFILES (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.staff_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_id text UNIQUE NOT NULL, -- e.g. 'ACC-1001'
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  role staff_role NOT NULL DEFAULT 'Staff',
  status account_status NOT NULL DEFAULT 'Active',
  contact_number text,
  avatar_url text,
  date_added timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_profiles_role ON public.staff_profiles(role);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_status ON public.staff_profiles(status);

-- 5. CUSTOMER PROFILES (Registered players)
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone_number text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. COURT OPERATING SCHEDULE
CREATE TABLE IF NOT EXISTS public.court_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id text NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  operating_days text[] NOT NULL DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  opening_time time NOT NULL DEFAULT '06:00:00',
  closing_time time NOT NULL DEFAULT '02:00:00',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. BLOCKED / UNAVAILABLE DATES (Maintenance / Special Events)
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id text NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  reason text NOT NULL DEFAULT 'Maintenance',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_blocked_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_range ON public.blocked_dates (court_id, start_time, end_time);

-- 8. SYSTEM PRICING RULES (Single active configuration row)
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id text PRIMARY KEY DEFAULT 'DEFAULT',
  day_rate_hourly numeric(10, 2) NOT NULL DEFAULT 200.00,
  night_rate_hourly numeric(10, 2) NOT NULL DEFAULT 300.00,
  night_start_time time NOT NULL DEFAULT '18:00:00',
  base_players integer NOT NULL DEFAULT 4,
  extra_player_rate numeric(10, 2) NOT NULL DEFAULT 100.00,
  paddle_rental_rate numeric(10, 2) NOT NULL DEFAULT 100.00,
  paddle_stock integer NOT NULL DEFAULT 16,
  ball_rental_rate numeric(10, 2) NOT NULL DEFAULT 50.00,
  ball_stock integer NOT NULL DEFAULT 10,
  cancellation_cutoff_hours integer NOT NULL DEFAULT 24,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. BOOKINGS & CONFLICT PREVENTION
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text UNIQUE NOT NULL, -- e.g. 'CR-1001'
  court_id text NOT NULL REFERENCES public.courts(id) ON DELETE RESTRICT,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  booking_source booking_source NOT NULL DEFAULT 'Online / App',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  duration_hours numeric(4, 2) NOT NULL,
  player_count integer NOT NULL DEFAULT 4,
  paddle_rental_count integer NOT NULL DEFAULT 0,
  ball_rental_count integer NOT NULL DEFAULT 0,
  court_rate_amount numeric(10, 2) NOT NULL,
  extra_players_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
  equipment_rental_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
  total_amount numeric(10, 2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'Pending Payment',
  notes text,
  expires_at timestamptz, -- 15-minute slot hold for pending checkouts
  created_by_staff_id uuid REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_booking_time_range CHECK (end_time > start_time),
  -- Exclusion constraint preventing double booking on the same court
  CONSTRAINT no_overlapping_active_bookings EXCLUDE USING gist (
    court_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status IN ('Pending Payment', 'Reserved', 'Confirmed', 'In Progress', 'Completed'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_time_range ON public.bookings(court_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(reference_number);

-- 10. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reference_number text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'Pending',
  paymongo_payment_id text,
  paymongo_intent_id text,
  paid_at timestamptz,
  verified_by_staff_id uuid REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  receipt_number text UNIQUE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);

-- 11. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id text UNIQUE NOT NULL, -- e.g. 'ANN-1'
  title text NOT NULL,
  description text NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  posted_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON public.announcements(is_pinned, posted_at DESC);

-- 12. SYSTEM SETTINGS (Business Details & Media)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id text PRIMARY KEY DEFAULT 'BUSINESS',
  business_name text NOT NULL DEFAULT 'Saranay Pickleball Court',
  facebook_url text DEFAULT 'facebook.com/saranaypickleball',
  business_address text DEFAULT 'Saranay Homes, Block 5 Lot 13 Saranay Road, Bagumbong, North Caloocan',
  phone_primary text DEFAULT '0921 000 8712',
  phone_secondary text DEFAULT '0960 000 0000',
  logo_url text DEFAULT '/saranay-logo.png',
  banner_url text DEFAULT '/bgpic.jpg',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 13. GALLERY IMAGES
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 14. FAQS
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL, -- 'GENERAL', 'BOOKING', 'RAIN', 'LIABILITY'
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category, display_order);

-- 15. AUDIT LOGS (Immutable historical activity records)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id text UNIQUE NOT NULL, -- e.g. 'LOG-2001'
  category log_category NOT NULL,
  activity text NOT NULL,
  action text NOT NULL,
  entity_table text,
  entity_id text,
  performed_by_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_by_name text NOT NULL DEFAULT 'System',
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON public.audit_logs(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
