# 🎬 CineBook - Production-Ready Cinema Ticket-Booking Platform

A state-of-the-art cinema ticketing platform ready for instant deployment on **Vercel** with **Neon Serverless PostgreSQL** from Vercel Marketplace, **Drizzle ORM**, multi-agent architecture, secure seat holds with atomic database transactions, dynamic SVG QR passes, and an administrative operations suite.

---

## 🏛️ Team CineBook Architecture

### 1. Agent 1 - App Agent (UI / UX & Client Experience)
- **Aesthetic**: Premium dark cinema ambiance with glassmorphism, luminous amber/cyan highlights, and fluid micro-interactions.
- **Pages**:
  - `/` - Home Hero, featured trailers, fast booking widget, Now Showing & Coming Soon tabs.
  - `/movies` & `/movies/[id]` - Rich movie catalog, synopsis, trailers, cast metadata, and grouped showtimes.
  - `/cinemas` & `/cinemas/[id]` - Flagship cinemas directory, screen format details (IMAX 70mm, Dolby Atmos, VIP Luxe), amenities, and schedules.
  - `/showtimes/[id]` - Interactive curved cinema screen seat picker with live seat status (Available, Held, Booked, Selected), tiered multipliers, and 10-minute hold reservation.
  - `/checkout/[bookingId]` - Itemized order summary, 10-minute countdown lock, promo codes (`CINEVIP`, `POPCORN`), test payment gateway with 1-click test card filler, and idempotency protection.
  - `/tickets/[ticketId]` - Digital Boarding Pass Cinema Ticket with dynamic QR code (SVG), barcode, calendar export (.ics), and print support.
  - `/bookings` - Customer booking history, status badges, and server-side cancellation/refund processing (>2h before showtime).
  - `/auth/login` & `/auth/register` - Secure authentication with 1-click Demo Customer & Admin profiles.
  - `/admin/*` - Administrator portal (Overview metrics, Movie Manager, Showtime Scheduler, Cinema screens, QR Ticket Scanner Gate validator, and Database Audit Logs).

### 2. Agent 2 - Database Engine Agent (Neon PostgreSQL + Drizzle ORM)
- **14 Tables**: `users`, `movies`, `genres`, `movie_genres`, `cinemas`, `auditoriums`, `seats`, `showtimes`, `showtime_seats`, `bookings`, `booking_items`, `payments`, `tickets`, `audit_logs`.
- **Database Rules**:
  - UUID primary keys (`gen_random_uuid()`).
  - UTC timestamps with timezone.
  - Integer minor units (cents e.g. `$16.50` -> `1650`), never floating-point.
  - Foreign keys, cascade rules, and unique constraints on screen names, seat positions, and showtime-seat locking.
  - Strict seat status transitions: `AVAILABLE`, `HELD`, `BOOKED`, `BLOCKED`.
  - Booking status: `PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED`, `REFUNDED`.
  - Payment status: `PENDING`, `SUCCEEDED`, `FAILED`, `REFUNDED`.

### 3. Agent 3 - Deployment & Operations Agent (Vercel Ready)
- **Vercel Serverless Functions** for backend route handlers and server actions.
- **Vercel Cron** (`vercel.json`) scheduled to run `/api/cron/release-holds` protected by `CRON_SECRET`.
- **Idempotent Hold Release**: Cleans expired seat holds safely on repeated runs.

---

## 💳 Booking Transaction Protocol

1. **Transaction Begin**: Atomically lock requested seat records for the showtime.
2. **Availability Check**: Confirm every selected seat is currently `AVAILABLE` (or owned by user).
3. **Seat Hold**: Transition seat status to `HELD` with an expiration timestamp (`NOW() + 10 minutes`).
4. **Server Pricing**: Compute ticket multipliers, booking fees, and tax in integer cents.
5. **Pending Booking**: Create pending booking record with unique reference (e.g. `CB-8492-71X`) and idempotency key.
6. **Payment Processing**: Verify test payment and idempotency key to prevent double charging.
7. **Confirmation**: Atomically transition seats to `BOOKED`, booking to `CONFIRMED`, payment to `SUCCEEDED`.
8. **Digital Ticket Issuance**: Generate digital tickets with cryptographically verifiable QR payload.
9. **Idempotent Hold Release Cron**: Safely releases unpurchased seat holds back to `AVAILABLE` after 10 minutes.

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```env
# Neon Serverless PostgreSQL Database Connection
DATABASE_URL="postgresql://neondb_owner:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
CRON_SECRET="cinebook_cron_secret_secure_token_xyz987"
AUTH_SECRET="cinebook_jwt_super_secret_signing_key_min_32_chars_2026"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts

For instant testing and evaluation:

| Role | Email | Password | Quick-Action |
|---|---|---|---|
| **Admin** | `admin@cinebook.com` | `AdminPass123!` | Click "Admin Demo" on Sign In |
| **Customer** | `customer@cinebook.com` | `CustomerPass123!` | Click "Customer Demo" on Sign In |

---

## 📦 Vercel Deployment

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the repository into **Vercel**.
3. Add **Neon Serverless PostgreSQL** from Vercel Marketplace (automatically provisions `DATABASE_URL` / `POSTGRES_URL`).
4. Configure `CRON_SECRET` and `AUTH_SECRET` in Vercel Environment Variables.
5. Deploy! Vercel Cron will automatically invoke `/api/cron/release-holds` every minute.
