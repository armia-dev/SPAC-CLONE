# SPaC — Saranay Pickleball Court Booking Management System

A full-featured court booking, scheduling, and facility management system designed specifically for **Saranay Pickleball Court** in North Caloocan, Philippines.

Built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Supabase (PostgreSQL, Auth, RLS, Storage, Edge Functions)**.

---

## Features

- **Public Player Portal (`/customer`)**:
  - Live availability calendar with 1-hour slot increments (6:00 AM – 2:00 AM).
  - 3-step booking flow: Date & Time, Players & Gear (paddles and balls), Review & Policies.
  - Pro-rated pricing (Daytime ₱200/hr, Nighttime ₱300/hr from 6:00 PM).
  - Instant official receipt generation and reference-number guest booking lookup.
- **Administrative Portal (`/`)**:
  - **Smart Role-Based Login (`/login`)**: Automatically determines role and permissions from trusted PostgreSQL database records.
  - **Today's Timeline & Schedule**: 20-hour live occupancy monitoring and weekly occupancy trends.
  - **Master Bookings Management**: Real-time filtering, search, view, reschedule, and 24-hour policy cancellation enforcement.
  - **Multi-Role RBAC**: Owner, Admin, Manager, Staff, Cashier, and Court Attendant with granular permissions.
  - **Financial Reports & Analytics**: Revenue breakdown, court utilization, transaction trends, and exportable audit summaries.
  - **Immutable Audit Trail**: Database-level activity logging across bookings, payments, staff accounts, and system settings.
  - **Dynamic System Settings**: Configure court rates, operating hours, maintenance blocked dates, announcements, and FAQs.

---

## Tech Stack

- **Frontend**: React 19, React Router v7, Tailwind CSS v4, Lucide Icons, Recharts
- **Build System**: Vite 8, Node.js 22, Oxlint
- **Database & Auth**: Supabase PostgreSQL 15+, Supabase Auth, Row Level Security (RLS)
- **Integrations**: PayMongo API (GCash, QR Ph, Maya, Cards), Google Gmail API

---

## Getting Started

### 1. Prerequisites
- Node.js 22+
- npm 10+
- A Supabase Project ([supabase.com](https://supabase.com))

### 2. Installation
```bash
git clone <repository-url>
cd spac-booking-management-system
npm install
```

### 3. Environment Setup
Copy the template environment file:
```bash
cp .env.example .env
```
Fill in your Supabase credentials in `.env`:
```ini
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Database Migrations
Deploy the version-controlled SQL migrations located in `supabase/migrations/` sequentially in your Supabase SQL Editor:
1. `20261016000001_core_schema.sql` (Tables, constraints, indexes, exclusion constraints)
2. `20261016000002_functions_and_triggers.sql` (Sequences, audit triggers, pricing functions)
3. `20261016000003_rls_policies.sql` (Row Level Security policies)
4. `20261016000004_initial_seed.sql` (Default court, pricing, settings, and admin provisioning)

### 5. Verify Database Schema
Run the static migrations verification script:
```bash
npm run db:verify
```

### 6. Development Server
Start the development server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Project Documentation

- [PRODUCT.md](PRODUCT.md): User personas, feature workflows, and business rules.
- [DESIGN.md](DESIGN.md): Design tokens, typography, color palette, and component patterns.
- [ARCHITECTURE.md](ARCHITECTURE.md): Technical architecture, ERD, and concurrency protection.
- [CLAUDE.md](CLAUDE.md): Developer commands, conventions, and security rules.
