# SwiftTab

Production-oriented MVP scaffold for a multi-tenant QR restaurant ordering platform for India.

## Current App Location

This repository is now a monorepo. The active Next.js app is:

```text
apps/web
```

See `TAKEOVER_STATUS.md` for the latest takeover notes, verification status, and known local Prisma file-lock issue.

## Scope

SwiftTab lets a customer scan a table QR, open `/menu/{restaurantSlug}/{tableNumber}`, browse a mobile menu, add instructions, place an order, and send it to the kitchen. Restaurant staff use the kitchen board for order status and the admin panel for operational management.

This is intentionally not a POS, inventory, accounting, payroll, GST, CRM, coupon, or delivery system.

## Stack

- Next.js 15 App Router
- React 19 and TypeScript
- Tailwind CSS with shadcn-style primitives
- PostgreSQL and Prisma ORM
- JWT cookie auth for restaurant admin and kitchen users
- WebSocket-ready realtime architecture, with polling fallback
- Docker and Docker Compose

## Run Locally

```bash
cd apps/web
cp .env.example .env
docker compose up -d postgres
npm install
npm run db:migrate
npm run dev
```

Open:

- Client demo: `http://localhost:3001/demo`
- Customer QR flow: `http://localhost:3001/demo/t/1`
- Kitchen: `http://localhost:3001/admin/kitchen`
- Admin: `http://localhost:3001/admin`

The `/demo` route is a database-free walkthrough for client presentations. The operational UI currently uses demo data while the API and Prisma schema define the production persistence boundaries.

## Environment Variables

`DATABASE_URL`: PostgreSQL connection string.

`JWT_SECRET`: strong private key used to sign restaurant staff sessions.

`APP_URL`: canonical app URL used for QR generation and callbacks.

`RATE_LIMIT_WINDOW_MS`: request window for in-memory MVP rate limiting.

`RATE_LIMIT_MAX_REQUESTS`: max requests per key per window.

## Project Structure

```text
apps/web/app/
  api/                    Next.js API routes
  admin/                  restaurant admin workspace
  [restaurantSlug]/t/     customer QR table flow
apps/web/components/
  admin/ customer/ kitchen/
  ui/                     reusable shadcn-style primitives
apps/web/src/shared/
  auth.ts                 JWT signing and verification
  tenant.ts               restaurant/table resolution
  validation.ts           zod request schemas
  upsell.ts               smart upsell selector
apps/web/prisma/
  schema.prisma           normalized multi-tenant data model
docs/
  architecture.md
  api-design.md
  realtime.md
```

## Testing

```bash
npm test
```

The included tests cover upsell selection. Add API route integration tests once a test database URL is available.
