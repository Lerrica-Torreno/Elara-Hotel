# ELARA Hotel Backend

Node.js + Express + Prisma + PostgreSQL backend shared by the customer booking UI and admin management dashboard.

## 1. Setup

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Create a PostgreSQL database named `elara_hotel` or update `DATABASE_URL` in `.env`.

## 2. First administrator

Only the first administrator can be created through the bootstrap route:

`POST /api/auth/admin/bootstrap`

```json
{
  "firstName": "Lerrica",
  "lastName": "Torreno",
  "email": "admin@example.com",
  "password": "StrongPass123"
}
```

After one admin exists, bootstrap is disabled. A SUPER_ADMIN or ADMIN creates additional staff using `POST /api/auth/admin/staff`.

## 3. Authentication

The API uses an HttpOnly session cookie. Both Vite frontends must call fetch with `credentials: "include"`.

Customer:
- `POST /api/auth/customer/register`
- `POST /api/auth/customer/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Admin:
- `POST /api/auth/admin/bootstrap` (first admin only)
- `POST /api/auth/admin/login`
- `POST /api/auth/admin/staff` (protected)

## 4. Customer booking flow

1. `GET /api/public/availability?checkIn=2026-10-01&checkOut=2026-10-03&guests=2`
2. Optional: `POST /api/public/promotions/validate`
3. `POST /api/reservations`
4. Payment provider confirms payment, then `POST /api/payments`
5. Customer views account reservations via `GET /api/reservations/mine`

Guest checkout remains supported. Guest users can retrieve a reservation with `POST /api/reservations/lookup` using reference + email.

## 5. Admin flow

- Dashboard: `GET /api/admin/dashboard`
- Rooms: `GET/POST/PATCH /api/admin/rooms`
- Room types: `GET/POST/PATCH /api/admin/room-types`
- Reservations: `GET /api/admin/reservations`
- Auto assignment: `POST /api/admin/reservations/:id/assign-optimal`
- Check-in: `POST /api/admin/reservations/:id/check-in`
- Check-out: `POST /api/admin/reservations/:id/check-out`
- Housekeeping: `/api/admin/housekeeping`
- Maintenance: `/api/admin/maintenance`
- Pricing: `/api/admin/pricing-rules`
- Promotions: `/api/admin/promotions`

## 6. Status workflow

Reservation:
`PENDING -> CONFIRMED -> CHECKED_IN -> CHECKED_OUT`

Cancellation:
`PENDING/CONFIRMED -> CANCELLED`

Room:
`AVAILABLE -> RESERVED -> OCCUPIED -> CLEANING -> AVAILABLE`

Maintenance:
`AVAILABLE -> MAINTENANCE -> CLEANING -> AVAILABLE`

## 7. Dynamic pricing

`RoomType.baseRate` is the starting rate. Active `PricingRule` rows are loaded in priority order and applied by the backend. The same quote endpoint is used by the customer UI, while the admin edits the same rules in PostgreSQL. This prevents the customer and admin interfaces from calculating different rates.

Supported dimensions:
- weekend/day of week
- occupancy percentage
- date/season/holiday windows
- historical demand label
- room type
- booking lead time
- fixed price, percentage adjustment, or flat adjustment

## 8. Production notes

Before production:
- use HTTPS
- use `COOKIE_SECURE=true`
- use a long random `JWT_SECRET`
- connect a real card/GCash payment provider and verify provider webhooks server-side
- add database backups and monitoring
- add audit logs for staff actions if required
- use Redis or another shared store if you later add distributed rate limiting/session revocation
