# Backend Logic (Supabase + Google Auth) — Booking System

This document describes the recommended backend design for the RHA villa booking system using **Supabase** (Auth + Postgres) with a **host-confirmation** workflow, and availability that correctly handles **overlapping configurations**:

- **Entire Villa**
- **3BHK in Villa**
- **Single room(s) in Villa**

It is written to align with the current app’s intent (book, admin confirm, show availability) while making the inventory model correct for overlapping bundles (a tree `parentId` model is not sufficient for this).

---

## Goals / Requirements

- **Google sign-in** for guests (Supabase Auth provider: Google).
- **Host confirmation required** before a booking blocks availability.
- **Single host/admin** who can see and manage all booking requests via an `/admin` page; other users cannot access it.
- **Overlapping inventory support**:
  - Booking a room may make 3BHK and Entire Villa unavailable for that date range (and vice-versa).
- **Checkout semantics**:
  - Check-in ~12:00 PM, checkout ~11:00 AM.
  - Availability is modeled using **date-only** ranges: `start_date` is check-in date, `end_date` is checkout date (non-inclusive).
    - A stay from Jan 10 → Jan 12 occupies nights of Jan 10 and Jan 11.
    - Another booking can start on Jan 12 (no overlap).
- **Free / low-cost**: no paid services required. Email via Gmail requested.

---

## Key Design Choice: Atomic Rooms + Configuration Bundles

Your three “configs” overlap. A simple parent/child hierarchy cannot represent “3BHK is a subset of Entire Villa while rooms are also bookable” without losing correctness.

**Solution**: represent availability using **atomic resources (rooms)**, and represent each config as a **bundle** of rooms.

- A guest selects a **configuration** (Entire Villa / 3BHK / Single Room).
- When the host confirms, the system creates **locks** on the underlying rooms.
- Availability is derived from those locks.

This is the standard pattern for:
- hotel room-types that map to multiple units,
- apartment configurations that share inventory,
- “whole house” vs “private rooms” listings.

---

## Inventory for this property

### Atomic room units (bookable “capacity”)
Based on your list:

- **Room with shared bathroom**: 1 unit
- **Room with attached bathroom**: 3 units
- **Twin sharing (per person)**: 1 unit

Total atomic units: **5**

> Note: whether “twin sharing (per person)” is sold as 1 unit or 2 separate “beds” is a business decision.
> For now, we treat it as **1 unit** (one booking reserves that twin room).

### Configurations (bundles)

- **Entire Villa** = all 5 units (shared + attached(3) + twin)
- **3BHK in Villa** = 3 units:
  - 2 × attached bathroom units
  - 1 × shared bathroom unit
- **Single rooms** = each atomic unit is individually selectable

Important: “3BHK” is a bundle that must pick **specific units** (e.g. attached#1 + attached#2 + shared#1) so that locks can be created deterministically.

---

## Data Model (Supabase Postgres)

### Tables

#### `profiles`
Stores app roles for authenticated users.

- `id uuid` (PK, references `auth.users.id`)
- `role text` (e.g. `guest` or `host`)
- `created_at timestamptz`

Single-host approach: set one user’s profile role to `host`.

#### `resources`
Atomic inventory units (rooms).

- `id uuid` (PK)
- `key text unique` (stable identifier, e.g. `shared_1`, `attached_1`, `attached_2`, `attached_3`, `twin_1`)
- `label text`
- `active boolean`
- `created_at timestamptz`

#### `configurations`
Selectable stay options.

- `id uuid` (PK)
- `slug text unique` (`entire_villa`, `villa_3bhk`, `shared_1`, `attached_1`, etc.)
- `label text`
- `active boolean`
- `created_at timestamptz`

#### `configuration_resources`
Many-to-many mapping from configuration to atomic resources.

- `configuration_id uuid` (FK to `configurations.id`)
- `resource_id uuid` (FK to `resources.id`)
- composite PK (`configuration_id`, `resource_id`)

#### `bookings`
Booking requests + decisions.

- `id uuid` (PK)
- `user_id uuid` (FK to `auth.users.id`)
- `configuration_id uuid` (FK to `configurations.id`)
- `start_date date` (check-in date)
- `end_date date` (checkout date, non-inclusive)
- `status text` (`pending`, `confirmed`, `rejected`, `cancelled`)
- `created_at timestamptz`
- `confirmed_at timestamptz null`
- `decision_note text null` (optional: host message)

#### `booking_locks`
The rows that actually block availability. Created only when a booking is confirmed.

- `id uuid` (PK)
- `booking_id uuid` (FK to `bookings.id`, on delete cascade)
- `resource_id uuid` (FK to `resources.id`)
- `start_date date`
- `end_date date`
- `created_at timestamptz`

---

## Correctness: Prevent Overlapping Confirmed Bookings

### Why “locks” instead of checking `bookings` directly?

Because configurations overlap, the system must block per atomic unit. Locks provide:
- a single source of truth for availability
- correct overlap checking even under concurrency

### Postgres exclusion constraint (recommended)

Use an exclusion constraint to prevent overlapping locks on the same resource:

```sql
-- Requires extension for GiST indexing support on scalar types.
create extension if not exists btree_gist;

-- Prevent overlapping date ranges per resource.
alter table booking_locks
add constraint booking_locks_no_overlap
exclude using gist (
  resource_id with =,
  daterange(start_date, end_date, '[)') with &&
);
```

This guarantees that two confirmed bookings cannot overlap on the same room unit, even if confirmations happen simultaneously.

---

## Booking Lifecycle

### 1) Guest creates a booking request (PENDING)

Input:
- `configuration_id` (or `slug`)
- `start_date`, `end_date`

Validation:
- `start_date < end_date`
- optionally: min nights, max nights, “start date not in past”, etc.

Side effects:
- Insert into `bookings` with `status='pending'`
- Send email notification to host (see Email section)

**Important**: pending bookings should **NOT** block availability by default (per your requirement).

### 2) Host confirms a booking (CONFIRMED)

Steps (must be atomic):
- Fetch booking + its configuration’s resources
- Insert one `booking_locks` row per resource
  - If any insert conflicts (exclusion constraint), the confirmation fails with “no longer available”
- Update booking status to `confirmed`, set `confirmed_at`
- Email guest confirmation

### 3) Host rejects a booking (REJECTED)
- Update booking status to `rejected`
- Email guest rejection

### 4) Cancellation
Decide policy (simple options):
- Host can cancel a pending or confirmed booking.
- If confirmed booking is cancelled, remove locks (cascade delete via booking delete, or explicitly delete locks).

---

## Availability Rules (what the frontend should display)

Availability should be computed from **confirmed locks only**:

- A date range is available for a given configuration if **none** of that configuration’s underlying resources have overlapping locks.
- Overlap test uses half-open interval `[start_date, end_date)`:
  - overlaps if `(existing.start < requested.end) AND (existing.end > requested.start)`

### “Blocked dates” for calendars

For a configuration calendar view:
- fetch locks for all its resources in a time window
- union/merge overlapping ranges client-side for display

---

## Admin Page Security (single host)

### Backend authorization

Enforce host-only actions (confirm/reject/cancel) using RLS + server-side checks.

- `profiles.role = 'host'` is the source of truth.
- Confirm/reject endpoints should verify host role.

### Frontend routing

Hide `/admin` links from non-host users, and protect the route with server-side checks so it cannot be accessed by typing the URL.

---

## Row Level Security (RLS) Plan

Enable RLS on all user-facing tables.

### Guests

- `bookings`
  - Insert: only if `user_id = auth.uid()` and `status = 'pending'`
  - Select: only rows where `user_id = auth.uid()`
  - Update: generally disallow guests (host decides)

- `booking_locks`
  - Select: allow reading only non-sensitive columns (resource + dates) or expose via a dedicated view/RPC.
  - Insert/Update/Delete: host-only (or service role only).

### Host

- Full select on bookings
- Can update booking status
- Can create/delete locks

> Implementation detail: you can implement host privileges in RLS using:
> - a `profiles` lookup (`exists (select 1 from profiles where id = auth.uid() and role='host')`)
> - or a custom JWT claim, if you choose to manage it that way later.

---

## Email Notifications (Gmail) — Vercel Constraint

You asked for “Gmail email notifications” and deployment is **Vercel**.

### Important constraint

Vercel (and many serverless platforms) commonly **block direct outbound SMTP** (ports like 25/465/587). That means a traditional Node SMTP client against Gmail may fail in production even if it works locally.

### Recommended “free + works on Vercel” options

#### Option A (recommended): Gmail API (HTTP, not SMTP)

- Use the **Gmail API** to send email via HTTPS.
- Works on Vercel because it uses normal outbound HTTPS.
- Requires setting up a Google Cloud project and OAuth credentials.

Notes:
- You must securely store credentials in environment variables.
- Token handling must be designed carefully (refresh tokens).
- This is the most “Gmail-pure” approach without relying on SMTP.

#### Option B (pragmatic fallback): free-tier email API

If Gmail API setup is too heavy, services like Resend often have a free tier and use HTTPS (Vercel-friendly).

This is not “Gmail”, but it satisfies “free email notifications” more reliably than SMTP on Vercel.

---

## Authentication Providers

The app supports OAuth sign-in via:
- Google
- Facebook


### When to send emails

- On `pending` booking creation: email host with request details
- On host decision:
  - `confirmed`: email guest confirmation
  - `rejected`: email guest rejection
  - `cancelled`: email guest cancellation (optional)

### Do not email sensitive data

Email content should avoid:
- secrets/tokens
- payment info (none for now)
- unnecessary PII beyond guest email/name and booking dates

---

## Suggested API / Backend Surface

Even with Supabase “frontend usage”, keep **write** operations behind a trusted backend (Next.js Route Handlers or Supabase Edge Functions) to ensure validation + secure role enforcement.

### Guest endpoints

- `POST /api/bookings`
  - creates `pending` booking request

- `GET /api/bookings`
  - returns the current user’s bookings

- `GET /api/availability?configurationSlug=...&from=...&to=...`
  - returns blocked ranges (from locks) for the selected configuration

### Host endpoints (admin)

- `GET /api/admin/bookings`
  - list all pending/confirmed/etc bookings

- `POST /api/admin/bookings/:id/confirm`
  - creates locks + sets booking confirmed

- `POST /api/admin/bookings/:id/reject`
  - sets booking rejected

---

## Seed Data (initial setup)

You will need to create:

### `resources` (5)
- `shared_1`
- `attached_1`
- `attached_2`
- `attached_3`
- `twin_1`

### `configurations`

Configs:
- `entire_villa` (maps to all 5 resources)
- `villa_3bhk` (maps to `shared_1` + `attached_1` + `attached_2`)
- Single-room configs (one per resource), e.g.:
  - `shared_1`
  - `attached_1`
  - `attached_2`
  - `attached_3`
  - `twin_1`

> If you later want guests to choose “any attached bathroom room” (not a specific one),
> you’d need a different model (capacity-based allocation). For now, we keep it deterministic and simple.

---

## Next Implementation Steps (when you’re ready)

- Add Supabase project + Google provider (Auth).
- Create the tables + RLS policies above.
- Update the app:
  - replace NextAuth/Prisma-based auth with Supabase Auth
  - update booking flow to create `pending` requests (not confirmed)
  - update admin confirmation to create locks and then confirm
  - update availability to read from locks
- Add email sender (Gmail API recommended for Vercel).


