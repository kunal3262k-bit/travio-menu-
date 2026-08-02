# Architecture

## Tenancy

Every owned record includes `restaurantId`. Read and write paths must resolve the restaurant first and scope all queries by that tenant key. Public customer routes use `restaurantSlug` plus `tableNumber`; staff routes use JWT claims containing `restaurantId` and role.

The key rule: never query mutable restaurant data by global IDs alone from an API route. Use `id + restaurantId` or a composite unique key such as `restaurantId_number`.

## Core Modules

Customer ordering:

- `/menu/{restaurantSlug}/{tableNumber}` renders the table-scoped menu.
- `/api/orders` validates the cart, snapshots names/prices, calculates subtotal, and creates the order.
- `/api/waiter-requests` creates call waiter or bill requests.

Kitchen:

- Kitchen users authenticate with JWT.
- Kitchen feed shows newest orders first.
- Status transitions are handled by `/api/orders/{orderId}/status`.

Admin:

- Admin users authenticate with JWT.
- Admin manages tables, QR codes, categories, items, availability, customers, order history, and analytics.

## Authentication Flow

1. Admin or kitchen user posts email/password to `/api/auth/login`.
2. Server validates credentials with bcrypt.
3. Server signs a 12-hour JWT with `sub`, `restaurantId`, `role`, and `email`.
4. Token is stored in an HTTP-only SameSite cookie.
5. Staff API routes call `requireSession(["ADMIN", "KITCHEN"])` or `requireSession(["ADMIN"])`.

Customers do not need accounts for the MVP.

## Security Baseline

- JWT is stored in an HTTP-only cookie.
- Staff APIs enforce server-side role authorization.
- Public APIs validate payloads with zod.
- Customer order creation checks item availability inside the restaurant scope.
- Rate limiting is present as an in-memory MVP guard; replace with Redis in production.
- Menu item names and prices are snapshotted on order items to preserve order history.

## Performance Baseline

- Customer menu is mobile-first and image lazy loading is handled by Next Image.
- Cart interactions are local and optimistic.
- Kitchen updates should use WebSockets where available, with polling fallback.
- Prisma queries should include only fields needed for each view.
- Cache public restaurant menu data with short TTL and invalidate on menu updates.

## Future Extension Points

- Payments: add a `PaymentIntent` module and publish domain events from order creation.
- WhatsApp: consume order/customer events asynchronously; do not call WhatsApp APIs from order transaction logic.
- POS integration: introduce an adapter module that mirrors completed orders.
- AI upselling: replace static `UpsellRule` ranking with a recommendation service behind the same interface.
