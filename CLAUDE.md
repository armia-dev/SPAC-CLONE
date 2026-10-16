# CLAUDE.md — Developer & AI Contributor Guide

## 1. Project Overview

The **SPaC Booking Management System** is a Vite + React 19 single-page application with a Supabase PostgreSQL backend, PayMongo payment gateway, and Google Gmail API integration for Saranay Pickleball Court.

---

## 2. Environment & Scripts

### 2.1 Essential Commands
- `npm run dev`: Starts the local development server on `http://0.0.0.0:3000`.
- `npm run build`: Compiles the production bundle via Vite.
- `npm run lint`: Validates code with Oxlint.
- `npm run db:verify`: Statically audits all SQL migrations, RLS policies, and exclusion constraints.

### 2.2 Environment Configuration
Copy `.env.example` to `.env`:
- `VITE_SUPABASE_URL`: Your Supabase Project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous public key.
- Server secrets (`SUPABASE_SERVICE_ROLE_KEY`, `PAYMONGO_SECRET_KEY`, `GMAIL_*`) must **never** be prefixed with `VITE_` or included in frontend client bundles.

---

## 3. Database & Migrations Workflow

All database schemas, functions, and RLS policies are version-controlled in `supabase/migrations/`:
1. `20261016000001_core_schema.sql`: Core tables, constraints, enums, indexes, and double-booking exclusion constraint.
2. `20261016000002_functions_and_triggers.sql`: Sequences, timestamps, automated audit triggers, and rate calculator functions.
3. `20261016000003_rls_policies.sql`: Row Level Security policies enforcing RBAC and least privilege.
4. `20261016000004_initial_seed.sql`: Baseline court, pricing, announcements, FAQs, and `provision_initial_admin()` procedure.

### Deploying Migrations
- **Supabase CLI**:
  ```bash
  supabase db push
  ```
- **Supabase Cloud Dashboard**:
  Execute migrations sequentially in the Supabase SQL Editor.

---

## 4. Security & Architecture Rules

1. **Role Authority**:
   - Never trust roles from `localStorage`, cookies, URL parameters, or client state.
   - Roles are always evaluated from the server-side `staff_profiles` table via `auth.current_staff_role()`.
2. **Double-Booking Guard**:
   - All booking reservations must respect the database exclusion constraint `no_overlapping_active_bookings`.
3. **Audit Log Immutability**:
   - Audit logs are append-only via PostgreSQL triggers. Direct client insertion is revoked.
4. **Least Privilege**:
   - Enable RLS on every table. Never use unrestricted `USING (true)` on sensitive tables (`staff_profiles`, `bookings`, `payments`, `audit_logs`).
