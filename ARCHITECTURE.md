# SPaC Booking Management System — Technical Architecture

## 1. System Architecture Diagram

```
+-------------------------------------------------------------------------------+
|                               Browser Client                                  |
|     React 19 SPA (Vite + Tailwind CSS v4 + React Router v7 + Supabase JS)     |
+-----------------------+-------------------------------+-----------------------+
                        |                               |
                 (Direct HTTPS / RLS)             (Edge Functions)
                        |                               |
                        v                               v
+-----------------------------------------------+ +-----------------------------+
|               Supabase Backend                | |   Supabase Edge Functions   |
|                                               | |                             |
|  1. PostgreSQL 15+                            | |  1. /create-checkout-session|
|     - btree_gist Exclusion Constraints        | |  2. /paymongo-webhook       |
|     - Row Level Security (RLS) on all tables  | |  3. /send-transactional-mail|
|     - Security Definer Auth Helpers           | |  4. /create-staff-account   |
|     - Automated Audit Triggers                | +--------------+--------------+
|                                               |                |
|  2. Supabase Auth (Identity & JWTs)           |                |
|  3. Supabase Storage (Buckets: branding, etc) |                v
+-----------------------------------------------+ +-----------------------------+
                                                  |   External Integrations     |
                                                  |                             |
                                                  |  - PayMongo API (GCash, QR) |
                                                  |  - Google Gmail API (OAuth) |
                                                  +-----------------------------+
```

---

## 2. Database Schema & Data Dictionary

### 2.1 Core Entities & Relationships

```
courts (1) <---------- (M) bookings (1) <---------- (M) payments
   ^                        |
   |                        v
court_schedules (M)      audit_logs (M) <--- populated via triggers
   ^
   |
blocked_dates (M)

auth.users (1) <------ (1) staff_profiles
auth.users (1) <------ (1) customer_profiles
```

### 2.2 Table Definitions
- `courts`: Physical bookable courts (`id`, `name`, `description`, `is_active`).
- `staff_profiles`: Operational team identities (`id` FK to `auth.users`, `staff_id`, `full_name`, `email`, `role`, `status`, `contact_number`).
- `customer_profiles`: Registered customer accounts (`id` FK to `auth.users`, `full_name`, `email`, `phone_number`).
- `court_schedules`: Operating windows per court (`operating_days`, `opening_time`, `closing_time`).
- `blocked_dates`: Scheduled maintenance and unavailable periods (`start_time`, `end_time`, `reason`).
- `pricing_rules`: System hourly rates, extra player fees, paddle/ball rental rates, and stock.
- `bookings`: Master reservation records with `no_overlapping_active_bookings` exclusion constraint.
- `payments`: Transaction records linking to PayMongo payments, intents, and official receipt numbers.
- `announcements`: Management broadcast notices (`title`, `description`, `is_pinned`).
- `system_settings`: Business information, address, contact numbers, and media assets.
- `gallery_images`: Public landing page photo showcase.
- `faqs`: Question-answer repository with category and display order.
- `audit_logs`: Immutable security and operation audit events.

---

## 3. Concurrency & Conflict Prevention

To prevent concurrent double-booking of slots, SPaC uses a PostgreSQL **Exclusion Constraint** via `btree_gist`:

```sql
CONSTRAINT no_overlapping_active_bookings EXCLUDE USING gist (
  court_id WITH =,
  tstzrange(start_time, end_time) WITH &&
) WHERE (status IN ('Pending Payment', 'Reserved', 'Confirmed', 'In Progress', 'Completed'));
```

### Why Browser Checks Fail
If two customers submit bookings for 7:00 PM – 8:00 PM simultaneously, any browser-side check will report the slot as open for both. The database exclusion constraint guarantees that the first transaction commits, and the second transaction immediately raises a serialization conflict before any payment is initiated.

---

## 4. Role-Based Access Control & RLS

### 4.1 Security Definer Functions
- `auth.current_staff_role()`: Resolves the caller's role from `public.staff_profiles` where `id = auth.uid()` and `status = 'Active'`.
- `auth.is_staff()`: Returns true if the user is an active staff member.
- `auth.is_admin()`: Returns true if the user's role is `'Owner'` or `'Admin'`.
- `auth.is_manager_or_admin()`: Returns true if the user's role is `'Owner'`, `'Admin'`, or `'Manager'`.

### 4.2 Immutable Audit Logging
Audit logs cannot be written to or modified directly through Supabase PostgREST APIs (`REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM public, anon, authenticated`). All entries are written exclusively via trusted PostgreSQL database triggers (`AFTER INSERT OR UPDATE`).
