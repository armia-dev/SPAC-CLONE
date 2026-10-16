-- ==============================================================================
-- SPaC Booking Management System — Migration 06: Login Email Lookup
-- ==============================================================================
-- This deliberately reveals whether an email has an Auth account so login can
-- distinguish an unknown email from an incorrect password.

CREATE OR REPLACE FUNCTION public.auth_email_exists(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email = pg_catalog.lower(pg_catalog.btrim(p_email))
  );
$$;

REVOKE ALL ON FUNCTION public.auth_email_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_email_exists(text) TO anon, authenticated;
