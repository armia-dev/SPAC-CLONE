-- ==============================================================================
-- SPaC Booking Management System — Migration 02: Functions, Sequences & Triggers
-- ==============================================================================

-- 1. AUTOMATIC UPDATED_AT TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_courts_updated_at BEFORE UPDATE ON public.courts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER trg_staff_updated_at BEFORE UPDATE ON public.staff_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER trg_customer_updated_at BEFORE UPDATE ON public.customer_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER trg_court_schedules_updated_at BEFORE UPDATE ON public.court_schedules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER trg_pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER trg_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER trg_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER trg_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. SEQUENCES FOR HUMAN-READABLE IDENTIFIERS
CREATE SEQUENCE IF NOT EXISTS public.seq_booking_ref START WITH 1001;
CREATE SEQUENCE IF NOT EXISTS public.seq_staff_id START WITH 1001;
CREATE SEQUENCE IF NOT EXISTS public.seq_log_id START WITH 2001;
CREATE SEQUENCE IF NOT EXISTS public.seq_announcement_id START WITH 1;

CREATE OR REPLACE FUNCTION public.next_booking_ref() RETURNS text AS $$
BEGIN
  RETURN 'CR-' || nextval('public.seq_booking_ref')::text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.next_staff_id() RETURNS text AS $$
BEGIN
  RETURN 'ACC-' || nextval('public.seq_staff_id')::text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.next_log_id() RETURNS text AS $$
BEGIN
  RETURN 'LOG-' || nextval('public.seq_log_id')::text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.next_announcement_id() RETURNS text AS $$
BEGIN
  RETURN 'ANN-' || nextval('public.seq_announcement_id')::text;
END;
$$ LANGUAGE plpgsql;

-- 3. SECURITY DEFINER AUTHENTICATION HELPERS
-- These functions execute with definer privileges to safely read staff_profiles
CREATE OR REPLACE FUNCTION auth.current_staff_role()
RETURNS text AS $$
  SELECT role::text FROM public.staff_profiles
  WHERE id = auth.uid() AND status = 'Active';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_staff()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND status = 'Active'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND status = 'Active' AND role IN ('Owner', 'Admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_manager_or_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND status = 'Active' AND role IN ('Owner', 'Admin', 'Manager')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4. AUTOMATED AUDIT LOGGING TRIGGER
CREATE OR REPLACE FUNCTION public.trigger_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_category log_category;
  v_action text;
  v_activity text;
  v_user_name text := 'System';
  v_user_id uuid := auth.uid();
  v_entity_id text;
  v_details jsonb;
BEGIN
  IF TG_TABLE_NAME = 'bookings' THEN
    v_category := 'Booking';
    IF TG_OP = 'INSERT' THEN
      v_action := 'Created reservation ' || NEW.reference_number;
      v_activity := 'Created reservation ' || NEW.reference_number || ' for ' || NEW.customer_name;
      v_entity_id := NEW.reference_number;
      v_details := jsonb_build_object('status', NEW.status, 'start_time', NEW.start_time, 'amount', NEW.total_amount);
    ELSIF TG_OP = 'UPDATE' THEN
      v_action := 'Updated reservation ' || NEW.reference_number;
      IF OLD.status <> NEW.status THEN
        v_activity := 'Changed reservation ' || NEW.reference_number || ' status from ' || OLD.status || ' to ' || NEW.status;
      ELSIF OLD.start_time <> NEW.start_time THEN
        v_activity := 'Rescheduled reservation ' || NEW.reference_number;
      ELSE
        v_activity := 'Updated reservation ' || NEW.reference_number;
      END IF;
      v_entity_id := NEW.reference_number;
      v_details := jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status);
    END IF;

  ELSIF TG_TABLE_NAME = 'payments' THEN
    v_category := 'Payment';
    IF TG_OP = 'INSERT' THEN
      v_action := 'Initiated payment for ' || NEW.reference_number;
      v_activity := 'Initiated ' || NEW.payment_method || ' payment of ₱' || NEW.amount;
      v_entity_id := NEW.reference_number;
    ELSIF TG_OP = 'UPDATE' THEN
      v_action := 'Updated payment for ' || NEW.reference_number;
      v_activity := 'Updated payment status to ' || NEW.payment_status || ' for ' || NEW.reference_number;
      v_entity_id := NEW.reference_number;
      v_details := jsonb_build_object('status', NEW.payment_status, 'receipt', NEW.receipt_number);
    END IF;

  ELSIF TG_TABLE_NAME = 'staff_profiles' THEN
    v_category := 'Account';
    IF TG_OP = 'INSERT' THEN
      v_action := 'Created staff account ' || NEW.staff_id;
      v_activity := 'Added staff account for ' || NEW.full_name || ' (' || NEW.role || ')';
      v_entity_id := NEW.staff_id;
    ELSIF TG_OP = 'UPDATE' THEN
      v_action := 'Updated staff account ' || NEW.staff_id;
      v_activity := 'Modified staff profile for ' || NEW.full_name;
      v_entity_id := NEW.staff_id;
    END IF;

  ELSIF TG_TABLE_NAME = 'system_settings' OR TG_TABLE_NAME = 'pricing_rules' THEN
    v_category := 'Settings';
    v_action := 'Updated facility settings';
    v_activity := 'Modified settings or court pricing configuration';
    v_entity_id := TG_TABLE_NAME;
  END IF;

  -- Resolve performing user display name
  IF v_user_id IS NOT NULL THEN
    SELECT COALESF(full_name, email) INTO v_user_name FROM public.staff_profiles WHERE id = v_user_id;
    IF v_user_name IS NULL THEN
      SELECT email INTO v_user_name FROM auth.users WHERE id = v_user_id;
    END IF;
  END IF;

  INSERT INTO public.audit_logs (
    log_id,
    category,
    activity,
    action,
    entity_table,
    entity_id,
    performed_by_id,
    performed_by_name,
    details
  ) VALUES (
    public.next_log_id(),
    v_category,
    COALESCE(v_activity, 'Action recorded'),
    COALESCE(v_action, 'Updated record'),
    TG_TABLE_NAME,
    v_entity_id,
    v_user_id,
    COALESCE(v_user_name, 'System'),
    v_details
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_audit_bookings
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

CREATE TRIGGER trg_audit_payments
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

CREATE TRIGGER trg_audit_staff
AFTER INSERT OR UPDATE ON public.staff_profiles
FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

CREATE TRIGGER trg_audit_settings
AFTER UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

CREATE TRIGGER trg_audit_pricing
AFTER UPDATE ON public.pricing_rules
FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

-- 5. SERVER-AUTHORITATIVE PRICING CALCULATION
CREATE OR REPLACE FUNCTION public.calculate_booking_quote(
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_player_count integer,
  p_paddle_count integer,
  p_ball_count integer
)
RETURNS jsonb AS $$
DECLARE
  v_rules public.pricing_rules%ROWTYPE;
  v_curr_hour timestamptz;
  v_next_hour timestamptz;
  v_local_time time;
  v_day_hours numeric(4,2) := 0;
  v_night_hours numeric(4,2) := 0;
  v_court_rate numeric(10,2);
  v_extra_players integer;
  v_extra_players_cost numeric(10,2);
  v_paddles_cost numeric(10,2);
  v_balls_cost numeric(10,2);
  v_total numeric(10,2);
  v_duration numeric(4,2);
BEGIN
  SELECT * INTO v_rules FROM public.pricing_rules WHERE id = 'DEFAULT' LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pricing rules not configured.';
  END IF;

  v_duration := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 3600.0;
  IF v_duration <= 0 OR v_duration > 12 THEN
    RAISE EXCEPTION 'Invalid booking duration: % hours', v_duration;
  END IF;

  -- Iterate hour by hour in Asia/Manila (UTC+8) to pro-rate daytime vs nighttime
  v_curr_hour := p_start_time;
  WHILE v_curr_hour < p_end_time LOOP
    v_next_hour := LEAST(v_curr_hour + interval '1 hour', p_end_time);
    -- Local time in Philippines
    v_local_time := (v_curr_hour AT TIME ZONE 'Asia/Manila')::time;

    -- Daytime: 06:00 to 18:00; Nighttime: 18:00 to 02:00
    IF v_local_time >= '06:00:00' AND v_local_time < v_rules.night_start_time THEN
      v_day_hours := v_day_hours + (EXTRACT(EPOCH FROM (v_next_hour - v_curr_hour)) / 3600.0);
    ELSE
      v_night_hours := v_night_hours + (EXTRACT(EPOCH FROM (v_next_hour - v_curr_hour)) / 3600.0);
    END IF;

    v_curr_hour := v_next_hour;
  END LOOP;

  v_court_rate := (v_day_hours * v_rules.day_rate_hourly) + (v_night_hours * v_rules.night_rate_hourly);
  v_extra_players := GREATEST(0, p_player_count - v_rules.base_players);
  v_extra_players_cost := v_extra_players * v_rules.extra_player_rate;
  v_paddles_cost := GREATEST(0, p_paddle_count) * v_rules.paddle_rental_rate;
  v_balls_cost := GREATEST(0, p_ball_count) * v_rules.ball_rental_rate;
  v_total := v_court_rate + v_extra_players_cost + v_paddles_cost + v_balls_cost;

  RETURN jsonb_build_object(
    'duration_hours', v_duration,
    'day_hours', v_day_hours,
    'night_hours', v_night_hours,
    'court_rate_amount', v_court_rate,
    'extra_players_count', v_extra_players,
    'extra_players_amount', v_extra_players_cost,
    'paddle_rental_count', p_paddle_count,
    'paddle_rental_amount', v_paddles_cost,
    'ball_rental_count', p_ball_count,
    'ball_rental_amount', v_balls_cost,
    'total_amount', v_total
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6. ATOMIC BOOKING RESERVATION CREATION
CREATE OR REPLACE FUNCTION public.create_booking_reservation(
  p_court_id text,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_player_count integer DEFAULT 4,
  p_paddle_count integer DEFAULT 0,
  p_ball_count integer DEFAULT 0,
  p_payment_method payment_method DEFAULT 'GCash',
  p_booking_source booking_source DEFAULT 'Online / App',
  p_notes text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_quote jsonb;
  v_ref text;
  v_booking_id uuid;
  v_blocked boolean;
BEGIN
  -- 1. Check if court exists
  IF NOT EXISTS (SELECT 1 FROM public.courts WHERE id = p_court_id AND is_active = true) THEN
    RAISE EXCEPTION 'Court % is not currently active or available.', p_court_id;
  END IF;

  -- 2. Verify no active maintenance block overlaps this timeframe
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_dates
    WHERE court_id = p_court_id
      AND tstzrange(start_time, end_time) && tstzrange(p_start_time, p_end_time)
  ) INTO v_blocked;

  IF v_blocked THEN
    RAISE EXCEPTION 'The selected slot overlaps with a scheduled maintenance or blocked period.';
  END IF;

  -- 3. Calculate server-authoritative rates
  v_quote := public.calculate_booking_quote(
    p_start_time,
    p_end_time,
    p_player_count,
    p_paddle_count,
    p_ball_count
  );

  v_ref := public.next_booking_ref();

  -- 4. Insert booking (protected by exclusion constraint against concurrent conflicting inserts)
  INSERT INTO public.bookings (
    reference_number,
    court_id,
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    booking_source,
    start_time,
    end_time,
    duration_hours,
    player_count,
    paddle_rental_count,
    ball_rental_count,
    court_rate_amount,
    extra_players_amount,
    equipment_rental_amount,
    total_amount,
    status,
    notes,
    expires_at,
    created_by_staff_id
  ) VALUES (
    v_ref,
    p_court_id,
    auth.uid(),
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_booking_source,
    p_start_time,
    p_end_time,
    (v_quote->>'duration_hours')::numeric,
    p_player_count,
    p_paddle_count,
    p_ball_count,
    (v_quote->>'court_rate_amount')::numeric,
    (v_quote->>'extra_players_amount')::numeric,
    ((v_quote->>'paddle_rental_amount')::numeric + (v_quote->>'ball_rental_amount')::numeric),
    (v_quote->>'total_amount')::numeric,
    'Pending Payment',
    p_notes,
    now() + interval '15 minutes',
    CASE WHEN auth.is_staff() THEN auth.uid() ELSE NULL END
  ) RETURNING id INTO v_booking_id;

  -- 5. Insert corresponding initial pending payment record
  INSERT INTO public.payments (
    booking_id,
    reference_number,
    amount,
    payment_method,
    payment_status,
    receipt_number
  ) VALUES (
    v_booking_id,
    v_ref,
    (v_quote->>'total_amount')::numeric,
    p_payment_method,
    'Pending',
    'REC-' || v_ref
  );

  RETURN jsonb_build_object(
    'booking_id', v_booking_id,
    'reference_number', v_ref,
    'total_amount', (v_quote->>'total_amount')::numeric,
    'expires_at', (now() + interval '15 minutes'),
    'quote', v_quote
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. GUEST BOOKING LOOKUP FUNCTION (Matches GuestBookingHistory.jsx)
CREATE OR REPLACE FUNCTION public.lookup_guest_booking(
  p_reference_number text,
  p_contact text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
  v_payment public.payments%ROWTYPE;
BEGIN
  SELECT * INTO v_booking FROM public.bookings
  WHERE UPPER(reference_number) = UPPER(TRIM(p_reference_number))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- If contact is provided, verify match (email or phone)
  IF p_contact IS NOT NULL AND TRIM(p_contact) <> '' THEN
    IF LOWER(v_booking.customer_email) <> LOWER(TRIM(p_contact))
       AND REPLACE(v_booking.customer_phone, ' ', '') <> REPLACE(TRIM(p_contact), ' ', '') THEN
      RETURN NULL;
    END IF;
  END IF;

  SELECT * INTO v_payment FROM public.payments WHERE booking_id = v_booking.id LIMIT 1;

  RETURN jsonb_build_object(
    'reference_number', v_booking.reference_number,
    'customer_name', v_booking.customer_name,
    'customer_email', v_booking.customer_email,
    'customer_phone', v_booking.customer_phone,
    'start_time', v_booking.start_time,
    'end_time', v_booking.end_time,
    'duration_hours', v_booking.duration_hours,
    'player_count', v_booking.player_count,
    'paddle_count', v_booking.paddle_rental_count,
    'ball_count', v_booking.ball_rental_count,
    'total_amount', v_booking.total_amount,
    'status', v_booking.status,
    'payment_method', v_payment.payment_method,
    'payment_status', v_payment.payment_status,
    'paid_at', v_payment.paid_at,
    'receipt_number', v_payment.receipt_number
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
