# API Design

## Public Customer APIs

### `POST /api/orders`

Creates a table order.

Request:

```json
{
  "restaurantSlug": "abc-cafe",
  "tableNumber": 12,
  "customerName": "Asha",
  "customerPhone": "9999999999",
  "instructions": "Serve together",
  "items": [
    {
      "menuItemId": "menu_item_id",
      "quantity": 2,
      "instructions": "Less spicy"
    }
  ]
}
```

Response:

```json
{
  "order": {
    "id": "order_id",
    "orderNumber": 1042,
    "status": "RECEIVED",
    "estimatedReadyAt": "2026-07-31T10:30:00.000Z"
  }
}
```

### `POST /api/waiter-requests`

Creates a waiter or bill request.

```json
{
  "restaurantSlug": "abc-cafe",
  "tableNumber": 12,
  "type": "CALL_WAITER"
}
```

## Staff APIs

### `POST /api/auth/login`

Authenticates admin or kitchen users.

```json
{
  "email": "admin@abccafe.in",
  "password": "strong-password"
}
```

### `PATCH /api/orders/{orderId}/status`

Requires `ADMIN` or `KITCHEN`.

```json
{
  "status": "PREPARING"
}
```

Allowed statuses:

- `ACCEPTED`
- `PREPARING`
- `READY`
- `SERVED`
- `COMPLETED`
- `CANCELLED`

## Admin APIs To Add Next

- `GET /api/admin/dashboard`
- `GET|POST /api/admin/tables`
- `PATCH /api/admin/tables/{tableId}`
- `GET /api/admin/tables/{tableId}/qr`
- `GET|POST /api/admin/categories`
- `PATCH|DELETE /api/admin/categories/{categoryId}`
- `GET|POST /api/admin/menu-items`
- `PATCH|DELETE /api/admin/menu-items/{menuItemId}`
- `GET|POST /api/admin/upsell-rules`
- `GET /api/admin/orders`
- `GET /api/admin/analytics`

All admin APIs must scope by `session.restaurantId`.
