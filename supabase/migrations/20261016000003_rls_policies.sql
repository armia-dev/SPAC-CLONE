-- ==============================================================================
-- SPaC Booking Management System — Migration 03: Row Level Security (RLS)
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. COURTS POLICIES
CREATE POLICY "Courts are publicly viewable"
  ON public.courts FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify courts"
  ON public.courts FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- 3. STAFF PROFILES POLICIES
CREATE POLICY "Active staff members can view staff directory"
  ON public.staff_profiles FOR SELECT
  USING (auth.is_staff());

CREATE POLICY "Only Admins can insert staff accounts"
  ON public.staff_profiles FOR INSERT
  WITH CHECK (auth.is_admin());

CREATE POLICY "Admins can update any staff profile"
  ON public.staff_profiles FOR UPDATE
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY "Staff can update own profile except role and status"
  ON public.staff_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.staff_profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM public.staff_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Only Owner can delete staff accounts"
  ON public.staff_profiles FOR DELETE
  USING (auth.current_staff_role() = 'Owner');

-- 4. CUSTOMER PROFILES POLICIES
CREATE POLICY "Customers can view their own profile"
  ON public.customer_profiles FOR SELECT
  USING (id = auth.uid() OR auth.is_staff());

CREATE POLICY "Customers can update their own profile"
  ON public.customer_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own customer profile"
  ON public.customer_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- 5. COURT SCHEDULES POLICIES
CREATE POLICY "Schedules are publicly viewable"
  ON public.court_schedules FOR SELECT
  USING (true);

CREATE POLICY "Admins can modify schedules"
  ON public.court_schedules FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- 6. BLOCKED DATES POLICIES
CREATE POLICY "Blocked dates are publicly viewable"
  ON public.blocked_dates FOR SELECT
  USING (true);

CREATE POLICY "Managers and Admins can manage blocked dates"
  ON public.blocked_dates FOR ALL
  USING (auth.is_manager_or_admin())
  WITH CHECK (auth.is_manager_or_admin());

-- 7. PRICING RULES POLICIES
CREATE POLICY "Pricing rules are publicly viewable"
  ON public.pricing_rules FOR SELECT
  USING (true);

CREATE POLICY "Only Admins can modify pricing rules"
  ON public.pricing_rules FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- 8. BOOKINGS POLICIES
CREATE POLICY "Staff can view all bookings"
  ON public.bookings FOR SELECT
  USING (auth.is_staff());

CREATE POLICY "Customers can view their own bookings"
  ON public.bookings FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Staff can create manual or walk-in bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.is_staff());

CREATE POLICY "Staff can update any booking"
  ON public.bookings FOR UPDATE
  USING (auth.is_staff())
  WITH CHECK (auth.is_staff());

CREATE POLICY "Customers can cancel their own booking if at least 24h ahead"
  ON public.bookings FOR UPDATE
  USING (
    customer_id = auth.uid()
    AND start_time > (now() + interval '24 hours')
    AND status IN ('Pending Payment', 'Reserved', 'Confirmed')
  )
  WITH CHECK (
    customer_id = auth.uid()
    AND status = 'Cancelled'
  );

-- 9. PAYMENTS POLICIES
CREATE POLICY "Staff can view all payments"
  ON public.payments FOR SELECT
  USING (auth.is_staff());

CREATE POLICY "Customers can view payments for their own bookings"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.customer_id = auth.uid()
    )
  );

CREATE POLICY "Cashiers, Managers, and Admins can update payment records"
  ON public.payments FOR UPDATE
  USING (auth.current_staff_role() IN ('Owner', 'Admin', 'Manager', 'Cashier'))
  WITH CHECK (auth.current_staff_role() IN ('Owner', 'Admin', 'Manager', 'Cashier'));

CREATE POLICY "Staff can insert manual payment records"
  ON public.payments FOR INSERT
  WITH CHECK (auth.current_staff_role() IN ('Owner', 'Admin', 'Manager', 'Cashier'));

-- 10. ANNOUNCEMENTS POLICIES
CREATE POLICY "Announcements are publicly readable"
  ON public.announcements FOR SELECT
  USING (true);

CREATE POLICY "Managers and Admins can manage announcements"
  ON public.announcements FOR ALL
  USING (auth.is_manager_or_admin())
  WITH CHECK (auth.is_manager_or_admin());

-- 11. SYSTEM SETTINGS POLICIES
CREATE POLICY "System settings are publicly readable"
  ON public.system_settings FOR SELECT
  USING (true);

CREATE POLICY "Only Admins can modify system settings"
  ON public.system_settings FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- 12. GALLERY IMAGES POLICIES
CREATE POLICY "Gallery images are publicly readable"
  ON public.gallery_images FOR SELECT
  USING (true);

CREATE POLICY "Managers and Admins can manage gallery images"
  ON public.gallery_images FOR ALL
  USING (auth.is_manager_or_admin())
  WITH CHECK (auth.is_manager_or_admin());

-- 13. FAQS POLICIES
CREATE POLICY "FAQs are publicly readable"
  ON public.faqs FOR SELECT
  USING (true);

CREATE POLICY "Managers and Admins can manage FAQs"
  ON public.faqs FOR ALL
  USING (auth.is_manager_or_admin())
  WITH CHECK (auth.is_manager_or_admin());

-- 14. AUDIT LOGS POLICIES (Append-only by DB triggers, read-only for Management)
CREATE POLICY "Managers and Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.is_manager_or_admin());

-- Direct client modifications to audit logs are strictly revoked
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM authenticated, anon, public;
