# DineFlow Antigravity Handoff

## Project

DineFlow is a Next.js 15 MVP scaffold for a multi-tenant QR restaurant ordering platform.

Main folder:

```text
outputs/dineflow
```

## What Is Included

- Customer QR menu: `/menu/abc-cafe/12`
- Client presentation demo: `/demo`
- Kitchen board: `/kitchen`
- Admin dashboard: `/admin`
- Prisma schema: `prisma/schema.prisma`
- API routes:
  - `POST /api/auth/login`
  - `POST /api/orders`
  - `PATCH /api/orders/[orderId]/status`
  - `POST /api/waiter-requests`
- Dockerfile and `docker-compose.yml`
- Architecture docs in `docs/`
- Upsell unit tests in `tests/upsell.test.ts`

## Current Verification

These passed in the Codex environment:

```bash
npm.cmd test
npm.cmd run build
```

Build output included all expected routes:

- `/`
- `/demo`
- `/menu/[restaurantSlug]/[tableNumber]`
- `/kitchen`
- `/admin`
- API routes

## Known Issue

The Codex local server environment became unreliable after multiple dev server restarts:

- Port `3000` was occupied by another process and returned 404.
- Port `3001` served an old/stale broken instance.
- Port `3002` served `/demo` successfully during verification, but the user still reported the visible demo was not working.

This looks like a local dev-server/browser-state problem, not a production build failure. Antigravity should start a clean dev server from the project folder and test from a fresh browser tab.

## Recommended Antigravity Steps

1. Open the `outputs/dineflow` folder.

2. Install dependencies:

```bash
npm install
```

3. Start the dev server on a clean port:

```bash
npm run dev -- -p 3005
```

4. Open:

```text
http://localhost:3005/demo
```

5. Validate:

- Click `Run demo`.
- The walkthrough should automatically progress through customer cart, kitchen, and admin states.
- Open `/menu/abc-cafe/12`.
- Add an item.
- Click `Place Order`.
- Confirm a success notice appears.
- Click call waiter and request bill icons.
- Confirm notices appear.

## Files Most Likely To Continue Work In

```text
components/demo/DemoMode.tsx
components/customer/CustomerMenu.tsx
components/kitchen/KitchenBoard.tsx
components/admin/AdminDashboard.tsx
lib/demo-data.ts
prisma/schema.prisma
app/api/orders/route.ts
app/api/waiter-requests/route.ts
```

## Next Fixes To Consider

- Add Playwright browser tests for `/demo` and `/menu/abc-cafe/12`.
- Replace demo-only notices with API-backed order/waiter request calls.
- Add a seeded demo database so the same flows work through Prisma instead of static data.
- Add a deterministic demo reset endpoint.
- Add QR code generation in admin tables.
- Add a real WebSocket or polling order feed for kitchen.

## Production Notes

This scaffold intentionally excludes:

- POS
- inventory
- GST
- accounting
- payroll
- coupons
- delivery fleet
- CRM

Payment and WhatsApp integrations should remain async modules, not direct dependencies of order creation.
