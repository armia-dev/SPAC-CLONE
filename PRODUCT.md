# SPaC Booking Management System — Product Specification

## 1. Vision & Executive Summary

The **Saranay Pickleball Court (SPaC) Booking Management System** is an end-to-end web application that automates court reservations, equipment rentals, payment processing, staff operations, and financial reporting for Saranay Pickleball Court located in Bagumbong, North Caloocan, Philippines.

The system replaces manual paper logbooks and informal messaging with a modern, server-authoritative scheduling platform designed to eliminate double-bookings, protect revenue, and provide clear role-based dashboards for staff.

---

## 2. User Personas & Roles

| Persona | Primary Goals | Key Workflows |
|---|---|---|
| **Online Player (Customer)** | Find open slots, book court time, rent equipment, pay via GCash/QR Ph, receive instant receipt. | Browse schedule → 3-step booking stepper → pay via gateway → download/view official receipt → manage bookings in history. |
| **Walk-in Player (Guest)** | Play without prior registration; pay at counter or lookup booking by reference number. | Approach counter for cashier walk-in entry OR search booking status via receipt reference number. |
| **Front-Desk Staff / Cashier** | Fast counter check-in, manual booking entry, accept cash/online transfers, issue receipts. | View master calendar → Add Booking modal (3-step) → record payment method → mark booking confirmed. |
| **Court Attendant** | Monitor active court sessions, verify player headcount, manage paddle and ball rental inventory. | View today's timeline and calendar schedule → check gear in/out → report maintenance issues. |
| **Facility Manager** | Oversee daily bookings, handle schedule rescheduling, manage announcements, review daily revenue. | Review week-ahead occupancy → publish announcements → monitor cancellations and rescheduling. |
| **Owner / Super Admin** | Full business governance, pricing control, staff account provisioning, audit logs, financial reports. | Set hourly rates and add-on fees → manage staff accounts and roles → inspect immutable audit trail → review revenue trends. |

---

## 3. Core Product Features & Requirements

### 3.1 Real-Time Scheduling & Conflict Prevention
- Single championship court configuration (`COURT-1`), expandable to multi-court.
- Operating hours: 6:00 AM to 2:00 AM daily (20 hours continuous).
- Slot resolution: 60-minute standard blocks with duration up to 8 hours.
- Strict database-enforced zero-overlapping concurrency guard preventing double-bookings.
- Blocked dates and maintenance downtime periods that automatically remove slots from public availability.

### 3.2 Dynamic Pricing & Pro-Rating Engine
- **Daytime Hourly Court Rate**: ₱200/hr (6:00 AM to 6:00 PM).
- **Nighttime Hourly Court Rate**: ₱300/hr (6:00 PM to 2:00 AM).
- **Pro-Rating Rule**: Bookings spanning across 6:00 PM are accurately pro-rated (e.g. 5:00 PM – 7:00 PM = 1 daytime hr @ ₱200 + 1 nighttime hr @ ₱300 = ₱500).
- **Base Included Capacity**: 4 players per session.
- **Additional Players**: ₱100 per extra player per session for groups exceeding 4 players.
- **Equipment Rental**: ₱100 per paddle, ₱50 per ball per session.

### 3.3 Reservation Lifecycle & 15-Minute Expiration
1. `Pending Payment`: Slot temporarily held for 15 minutes while customer completes payment.
2. `Reserved`: Payment successfully completed via gateway webhook or cashier verification.
3. `In Progress`: Slot is currently active during court operating hours.
4. `Completed`: Booking has concluded.
5. `Cancelled`: Cancelled by customer (≥24 hours prior) or administrator.
6. `No Show`: Customer failed to arrive.

### 3.4 24-Hour Cancellation & Reschedule Policy
- Customers can cancel or reschedule bookings self-service if the request is submitted at least 24 hours prior to slot start time.
- Cancellations submitted under 24 hours are non-refundable and require management intervention.
- Automated cash refunds are replaced by rebooking credits / vouchers to prevent fraud.

---

## 4. Status of Business Decisions

- **Court Resource Model**: Safe default is a single court (`COURT-1`), architected for multi-court expansion.
- **Timezone**: Strict UTC storage localized to `Asia/Manila` (PHT, UTC+8).
- **Staff Provisioning**: Closed system. No public staff signup. Only Admins/Owners create staff accounts.
- **Customer Auth**: Guest checkout enabled with reference-number lookup; optional customer accounts for booking history.
