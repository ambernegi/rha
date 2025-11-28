## RHA Villa Booking – Next.js 15 / PostgreSQL / Auth.js

RHA Villa Booking is a small booking platform that lets guests book either the **entire villa** or **individual rooms**, with a **hierarchical resource model** that prevents double-booking:

- Booking the **parent** resource (`Entire Villa`) blocks all child rooms.
- Booking a **child** resource (`Room`) blocks that room and the parent villa.

The app uses **Next.js 15 (App Router)**, **Auth.js / NextAuth v5 (Google OAuth)**, and **PostgreSQL via Prisma**. It is designed to be deployed on Vercel.

---

## Features

- **Hierarchical resources**: `Resource` model with parent/child relation (villa → rooms).
- **Conflict-safe bookings**: Transactional checks to prevent overlapping bookings between parent/children.
- **Google OAuth login** using Auth.js (NextAuth v5 style).
- **RBAC**:
  - Normal users: can create and view their own bookings.
  - Admin (owner): has a dashboard to see and manage all bookings.
- **API-first**:
  - `POST /api/bookings` – create booking with conflict logic.
  - `GET /api/bookings/availability` – fetch booked ranges for a resource (parent/child aware).
  - `GET /api/resources` – list villa and room hierarchy.
  - `GET/PATCH /api/admin/bookings` – admin list/update bookings.
- **Owner seeding via env**: the email in `ADMIN_EMAIL` is granted `ADMIN` role on first sign-in.
- **Concurrency test script** to validate no double-booking at the DB level.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Auth**: Auth.js / `next-auth@5` with Google provider
- **ORM**: Prisma (`@prisma/client`)
- **Database**: PostgreSQL
- **Validation**: Zod
- **Runtime**: Node.js (Vercel-ready)

---

## Project Structure Overview

### Root

- **`package.json`**
  - Scripts:
    - `dev` – run Next.js dev server.
    - `build` – production build.
    - `start` – start production server.
    - `lint` – run ESLint.
    - `prisma:generate` – generate Prisma Client.
    - `prisma:push` – push Prisma schema to DB.
    - `prisma:studio` – open Prisma Studio.
    - `test:bookings` – run the concurrency booking simulation script.
  - Declares dependencies: `next`, `react`, `next-auth`, `@prisma/client`, `@auth/prisma-adapter`, `zod`, etc.

- **`tsconfig.json`**
  - TypeScript configuration for the Next.js app.
  - Sets strict mode, bundler module resolution, JSX behavior, and the `@/*` path alias to `./src/*`.

- **`next.config.ts`**
  - Entry point for Next.js config (currently minimal; extend for images, experimental flags, etc.).

- **`prisma/schema.prisma`**
  - Prisma schema defining the database models and enums:
    - `User` – basic user fields (`email`, `name`, `image`, `role`, timestamps).
    - `Account`, `Session`, `VerificationToken` – used by Auth.js / NextAuth adapter.
    - `Resource` – villa/room model:
      - `parentId` self-relation to set up hierarchy (parent → children).
      - `price`, `description`, timestamps.
    - `Booking` – booking record:
      - Foreign keys to `User` and `Resource`.
      - `startDate`, `endDate`, `status`, `totalPrice`, timestamps.
    - `Role` enum – `USER`, `ADMIN`.
    - `BookingStatus` enum – `PENDING`, `CONFIRMED`, `CANCELLED`.
  - `datasource db` uses PostgreSQL with `DATABASE_URL`.

- **`README.md`**
  - This documentation file.

---

## `src/` – Application Code

### Auth & Database Utilities

- **`src/lib/prisma.ts`**
  - Singleton Prisma client for use across the app.
  - Enables query logging in development and avoids multiple client instances in dev/hot-reload.

- **`src/auth.ts`**
  - Main Auth.js (NextAuth v5) configuration:
    - Uses `PrismaAdapter` wired to the Prisma client.
    - Configures the Google provider via `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
    - Uses a **database session** strategy.
    - `session` callback:
      - Attaches `user.id` and `user.role` onto `session.user` so the client can read them.
    - `signIn` callback:
      - If the signing-in user’s email matches `ADMIN_EMAIL`, upgrades that user’s `role` to `ADMIN`.
    - Exports:
      - `auth` – helper to read the current session in server components/route handlers.
      - `handlers` – used by the `/api/auth/[...nextauth]` route.
      - `signIn`, `signOut` – action helpers if needed in UI.

- **`src/types/next-auth.d.ts`**
  - Type augmentation for `next-auth`:
    - Extends `User` with an optional `role`.
    - Extends `Session.user` with `id`, `role`, and basic profile fields.
  - Ensures TypeScript knows about `session.user.role` and `session.user.id`.

---

### Middleware

- **`src/middleware.ts`**
  - Global middleware that runs for selected routes:
    - Wrapped with `auth(...)` so it can read the session.
  - Behavior:
    - Protects `/dashboard/**` and `/admin/**` routes.
    - If not authenticated:
      - Redirects to the Auth.js sign-in route (`/api/auth/signin`) with `callbackUrl` back to the original URL.
    - If accessing `/admin/**`:
      - Checks `req.auth.user.role === "ADMIN"`.
      - If not admin, redirects to `/`.
  - `config.matcher` specifies which routes require this middleware.

---

### App Router (Pages & Layout)

All pages are under `src/app/` using the Next.js App Router.

- **`src/app/layout.tsx`**
  - Root layout for the entire app.
  - Imports `globals.css`.
  - Provides the shared shell:
    - **Header** with logo (`RHA Villa`) and navigation links:
      - `/` – home / landing.
      - `/book` – booking flow (UI to be expanded).
      - `/dashboard` – user bookings dashboard.
      - `/admin` – owner/admin dashboard.
    - **Main** container with consistent padding and max-width.
    - **Footer** with copyright.
  - Sets site-wide metadata (`title`, `description`).

- **`src/app/page.tsx`**
  - Landing page (`/`):
    - Hero section describing the villa and booking experience.
    - Primary CTA button linking to `/book`.
    - Secondary CTA linking to `/dashboard`.
    - Highlight card listing why to stay at the villa.
  - Uses the shared CSS utility classes (`hero`, `hero-content`, `btn-primary`, etc.).

> Note: Additional pages like `/book`, `/dashboard`, and `/admin` will be built on top of these shared styles and APIs to provide the full booking and owner experiences.

---

### Global Styles

- **`src/app/globals.css`**
  - Global CSS for the whole app:
    - CSS variables for colors: `--primary`, `--secondary`, `--background`, `--surface`, etc.
    - Base resets and typography (`box-sizing`, body font, background, etc.).
  - Layout & shell styles:
    - `.app-shell`, `.app-header`, `.app-main`, `.app-footer` – structure and sticky header.
    - `.nav-links`, `.logo` – navigation styling.
  - Landing page & UI components:
    - `.hero`, `.hero-content`, `.hero-card` – main landing layout.
    - `.btn-primary`, `.btn-secondary` – button styles.
    - `.card`, `.card-header`, `.card-title`, `.card-subtitle` – reusable card UI.
    - `.field`, `.form-grid` – simple form layout for future booking forms.
    - `.badge`, `.badge-success`, `.badge-warning`, `.badge-error` – small status pills.
    - `.table` – basic table styling (used for dashboards/lists).
    - `.chip` and `.chip-dot-*` – compact status chips.
    - Basic responsive breakpoint at `768px` to stack the hero sections on mobile.

---

### API Routes

All API routes live under `src/app/api/**` and use App Router route handlers.

- **`src/app/api/auth/[...nextauth]/route.ts`**
  - Connects Auth.js handlers to Next.js.
  - Exports:
    - `GET`, `POST` – delegated from `handlers` in `src/auth.ts`.
  - Powers all auth-related endpoints (`/api/auth/signin`, `/api/auth/signout`, etc.).

- **`src/app/api/resources/route.ts`**
  - `GET /api/resources`
  - Returns the list of resources (villa and rooms) from Prisma.
  - Ordered by `price` by default.
  - Intended for:
    - Booking page to show available villa/room options.
    - Admin to inspect the resource hierarchy.

- **`src/app/api/bookings/route.ts`**
  - `POST /api/bookings` – create a booking.
  - Requires an authenticated user (uses `auth()` to assert `session.user.id`).
  - Request body validated via **Zod**:
    - `resourceId: string (cuid)`
    - `startDate: string (ISO datetime)`
    - `endDate: string (ISO datetime)`
  - Logic:
    - Ensures `startDate < endDate`.
    - Loads the selected `Resource` with its parent and children.
    - Calculates which resource IDs must be checked:
      - If booking a **parent**:
        - Check parent + all children.
      - If booking a **child**:
        - Check child + its parent.
    - In a Prisma transaction:
      - Searches for any overlapping booking (`PENDING` or `CONFIRMED`) on any of these IDs:
        - Overlap rule: `startDate < requestedEnd` AND `endDate > requestedStart`.
      - If conflict exists → abort with 409 and `"Selected dates are no longer available"`.
      - Otherwise creates a `CONFIRMED` booking and computes `totalPrice` based on nights × resource price.

- **`src/app/api/bookings/availability/route.ts`**
  - `GET /api/bookings/availability?resourceId=...`
  - Looks up the requested resource and determines which related IDs to inspect (same parent/child logic as above).
  - Returns a list of existing bookings (id, resourceId, startDate, endDate) that affect availability:
    - Includes bookings on parent if requesting a child and vice versa.
  - Intended for:
    - Calendar / date-picker UI to grey out booked ranges.

- **`src/app/api/admin/bookings/route.ts`**
  - `GET /api/admin/bookings`
    - Requires `session.user.role === "ADMIN"`.
    - Returns all bookings with joined `user` and `resource`.
    - Sorted by `startDate` descending.
  - `PATCH /api/admin/bookings`
    - Requires `ADMIN`.
    - Request body: `{ id, status }`.
    - Validates `status` is one of `PENDING | CONFIRMED | CANCELLED`.
    - Updates the booking’s status.
  - Intended for:
    - Owner dashboard to manage and adjust bookings (e.g., cancel, confirm).

---

### Scripts

- **`scripts/simulate-bookings.js`**
  - Node script to **stress-test concurrent bookings** at the DB level.
  - Usage:
    - Ensure `DATABASE_URL` is set and schema is pushed (`npm run prisma:push`).
    - Run: `npm run test:bookings`.
  - What it does:
    - Upserts a test user (`test-user@example.com`).
    - Upserts a test villa (`villa-seed-id`) and room (`room-seed-id`) with a parent-child relation.
    - Deletes any previous bookings for those resources.
    - Launches **two transactions concurrently** that both try to book the same room and date range.
    - One should succeed and one should fail with a `CONFLICT` error.
    - Logs final booking count to verify that only a single booking was stored.

---

## Environment Variables (local & Vercel)

Create `.env.local` in the project root with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

AUTH_SECRET="a-long-random-string"
ADMIN_EMAIL="owner@example.com"

# Optional, but recommended in production (Vercel):
# AUTH_URL="https://your-project-name.vercel.app"
```

- **`DATABASE_URL`**: PostgreSQL connection string.
- **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`**: from your Google Cloud Console OAuth credentials.
- **`AUTH_SECRET`**: random string used by Auth.js (use `openssl rand -base64 32` or `npx auth secret`).
- **`ADMIN_EMAIL`**: the villa owner’s email; first sign-in with this email upgrades the user to `ADMIN`.
- **`AUTH_URL`**: base URL of your deployed app (e.g. `https://rha-booking.vercel.app`); used by Auth.js behind the scenes.

---

## Running Locally

1. **Install dependencies**

```bash
npm install
```

2. **Set up the database**

```bash
npm run prisma:generate
npm run prisma:push
```

Optionally open Prisma Studio to seed initial resources:

```bash
npm run prisma:studio
```

3. **Start the dev server**

```bash
npm run dev
```

Then visit `http://localhost:3000`.

---

## Deploying to Vercel

This project is designed to run on Vercel with minimal config:

1. **Create a Postgres database**  
   Use Vercel Postgres, Neon, Supabase, or any hosted PostgreSQL and copy the connection string as `DATABASE_URL`.

2. **Configure Google OAuth for production**  
   In Google Cloud Console → APIs & Services → Credentials → your OAuth client:
   - **Authorized JavaScript origins**:  
     - `https://your-project-name.vercel.app`
   - **Authorized redirect URIs**:  
     - `https://your-project-name.vercel.app/api/auth/callback/google`

3. **Create the Vercel project**  
   - Import the repo into Vercel.
   - Ensure the project root is the `rha` folder.

4. **Set environment variables in Vercel** (Project → Settings → Environment Variables):
   - `DATABASE_URL` – from step 1.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – from Google Cloud.
   - `AUTH_SECRET` – click “Generate” in Vercel or paste a strong random string.
   - `ADMIN_EMAIL` – owner email (e.g. `owner@example.com`).
   - Optional: `AUTH_URL` – `https://your-project-name.vercel.app`.

5. **Deploy**  
   Vercel will run `npm install`, then `npm run build`, which in turn triggers the Prisma `postinstall` (`prisma generate && prisma db push`) to sync the schema with your DB.

If a deployment fails, check the Vercel build logs after the Prisma section for the actual Next.js/TypeScript error and adjust accordingly.

---

## Testing the Booking Logic

- **Manual**
  - Log in with Google.
  - Use (or later, navigate to) the booking UI to create a booking for:
    - The entire villa.
    - A specific room.
  - Call `GET /api/bookings/availability?resourceId=<id>` to verify blocked dates for parent/child combinations.

- **Automated / Script**
  - Run the concurrency test to ensure the transaction logic prevents double-booking:

```bash
npm run test:bookings
```

This project is structured so you can iteratively build richer UIs (`/book`, `/dashboard`, `/admin`) on top of the already solid auth, RBAC, and booking API foundation described above.



