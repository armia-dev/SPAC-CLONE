-- ==============================================================================
-- SPaC Booking Management System — Migration 05: Secure Staff Management RPC
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.create_staff_account_rpc(
  p_email text,
  p_password text,
  p_full_name text,
  p_role staff_role,
  p_contact text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_staff_id text;
  v_clean_email text;
BEGIN
  -- 1. Security Check: Only active Owner or Admin can provision staff accounts
  IF NOT auth.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only Admins and Owners can provision staff accounts.';
  END IF;

  -- 2. Input Validation
  v_clean_email := LOWER(TRIM(p_email));
  IF v_clean_email IS NULL OR v_clean_email = '' OR v_clean_email NOT LIKE '%@%.%' THEN
    RAISE EXCEPTION 'Invalid email address provided.';
  END IF;

  IF p_full_name IS NULL OR TRIM(p_full_name) = '' THEN
    RAISE EXCEPTION 'Full name is required.';
  END IF;

  IF LENGTH(p_password) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters long.';
  END IF;

  -- Non-Owners cannot assign Owner role
  IF p_role = 'Owner' AND auth.current_staff_role() <> 'Owner' THEN
    RAISE EXCEPTION 'Only an existing Owner can assign the Owner role.';
  END IF;

  -- 3. Check for existing staff record
  IF EXISTS (SELECT 1 FROM public.staff_profiles WHERE email = v_clean_email) THEN
    RAISE EXCEPTION 'A staff account with email % already exists.', v_clean_email;
  END IF;

  -- 4. Check or create in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_clean_email;
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
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
      v_clean_email,
      crypt(p_password, gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      jsonb_build_object('full_name', p_full_name),
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
  END IF;

  -- 5. Insert staff profile
  v_staff_id := public.next_staff_id();
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
    v_clean_email,
    p_role,
    'Active',
    p_contact,
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'id', v_user_id,
    'staff_id', v_staff_id,
    'full_name', p_full_name,
    'email', v_clean_email,
    'role', p_role,
    'status', 'Active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
