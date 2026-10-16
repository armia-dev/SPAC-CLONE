-- ==============================================================================
-- SPaC Booking Management System — Migration 04: Default Data & Bootstrap Admin
-- ==============================================================================

-- 1. SEED DEFAULT COURT
INSERT INTO public.courts (id, name, description, is_active)
VALUES (
  'COURT-1',
  'Saranay Pickleball Court',
  'Standard championship pickleball court with premium lighting and non-slip surface.',
  true
)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED DEFAULT COURT OPERATING SCHEDULE
INSERT INTO public.court_schedules (court_id, operating_days, opening_time, closing_time)
VALUES (
  'COURT-1',
  ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  '06:00:00',
  '02:00:00'
)
ON CONFLICT DO NOTHING;

-- 3. SEED DEFAULT PRICING RULES
INSERT INTO public.pricing_rules (
  id,
  day_rate_hourly,
  night_rate_hourly,
  night_start_time,
  base_players,
  extra_player_rate,
  paddle_rental_rate,
  paddle_stock,
  ball_rental_rate,
  ball_stock,
  cancellation_cutoff_hours
)
VALUES (
  'DEFAULT',
  200.00,
  300.00,
  '18:00:00',
  4,
  100.00,
  100.00,
  16,
  50.00,
  10,
  24
)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED BUSINESS SYSTEM SETTINGS
INSERT INTO public.system_settings (
  id,
  business_name,
  facebook_url,
  business_address,
  phone_primary,
  phone_secondary,
  logo_url,
  banner_url
)
VALUES (
  'BUSINESS',
  'Saranay Pickleball Court',
  'facebook.com/saranaypickleball',
  'Saranay Homes, Block 5 Lot 13 Saranay Road, Bagumbong, North Caloocan',
  '0921 000 8712',
  '0960 000 0000',
  '/saranay-logo.png',
  '/bgpic.jpg'
)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED INITIAL ANNOUNCEMENTS
INSERT INTO public.announcements (announcement_id, title, description, is_pinned)
VALUES
  (
    'ANN-1',
    'Court Rate Adjustment',
    'Daytime rate is ₱200/hr (6:00 AM - 6:00 PM) and Nighttime rate is ₱300/hr (6:00 PM - 2:00 AM).',
    true
  ),
  (
    'ANN-2',
    'Equipment Rental Availability',
    'Paddles are available for rental at ₱100/session and balls at ₱50/session. Clean indoor court shoes required.',
    false
  )
ON CONFLICT (announcement_id) DO NOTHING;

-- 6. SEED INITIAL FAQS
INSERT INTO public.faqs (category, question, answer, display_order)
VALUES
  (
    'GENERAL',
    'What are the court operating hours?',
    'Our courts are open from 6:00 AM to 2:00 AM daily, Monday through Sunday.',
    1
  ),
  (
    'GENERAL',
    'How many players can play per court reservation?',
    'A standard booking covers up to 4 players. Additional players can join for ₱100 each per session.',
    2
  ),
  (
    'BOOKING',
    'What is your cancellation and reschedule policy?',
    'Cancellations and rescheduling requests are accepted at least 24 hours prior to your scheduled slot. Within 24 hours, cancellations are non-refundable.',
    1
  ),
  (
    'RAIN',
    'What happens if it rains during outdoor play?',
    'In case of heavy rain or hazardous weather, reservations will be credited for a free reschedule.',
    1
  )
ON CONFLICT DO NOTHING;

-- 7. INITIAL ADMINISTRATOR PROVISIONING PROCEDURE
-- Run this function in Supabase SQL editor to create or sync your first administrator
CREATE OR REPLACE FUNCTION public.provision_initial_admin(
  p_email text,
  p_password text,
  p_full_name text DEFAULT 'SPaC Super Admin',
  p_contact text DEFAULT '0917-000-0001',
  p_role staff_role DEFAULT 'Owner'
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_staff_id text;
BEGIN
  -- Check if user already exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = LOWER(TRIM(p_email));

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    -- Insert into Supabase auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      LOWER(TRIM(p_email)),
      crypt(p_password, gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      jsonb_build_object('full_name', p_full_name),
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
  ELSE
    -- If user exists, update password
    UPDATE auth.users
    SET encrypted_password = crypt(p_password, gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- Insert or update public.staff_profiles
  v_staff_id := 'ACC-1001';
  INSERT INTO public.staff_profiles (
    id,
    staff_id,
    full_name,
    email,
    role,
    status,
    contact_number,
    date_added
  ) VALUES (
    v_user_id,
    v_staff_id,
    p_full_name,
    LOWER(TRIM(p_email)),
    p_role,
    'Active',
    p_contact,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = p_role,
    status = 'Active',
    full_name = p_full_name,
    contact_number = p_contact,
    updated_at = now();

  RETURN jsonb_build_object(
    'user_id', v_user_id,
    'staff_id', v_staff_id,
    'email', LOWER(TRIM(p_email)),
    'role', p_role,
    'status', 'Active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
