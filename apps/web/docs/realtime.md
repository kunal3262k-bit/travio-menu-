# WebSocket Architecture

## Preferred Transport

Use a dedicated WebSocket server or managed realtime layer beside Next.js when deploying beyond one Node process. Next.js API routes are fine for HTTP but should not own durable socket state in serverless deployments.

Recommended event channels:

- `restaurant:{restaurantId}:orders`
- `restaurant:{restaurantId}:waiter-requests`
- `restaurant:{restaurantId}:tables`

## Events

`order.created`

```json
{
  "orderId": "order_id",
  "orderNumber": 1042,
  "tableNumber": 12,
  "status": "RECEIVED"
}
```

`order.status_changed`

```json
{
  "orderId": "order_id",
  "status": "READY"
}
```

`waiter_request.created`

```json
{
  "requestId": "request_id",
  "tableNumber": 12,
  "type": "REQUEST_BILL"
}
```

## MVP Fallback

Kitchen and admin screens can poll:

- orders every 5 seconds
- waiter requests every 10 seconds
- analytics every 60 seconds

Polling endpoints should support `updatedAfter` cursors to avoid reloading full boards.

## Production Recommendation

Publish domain events after database transactions commit. Use Redis Pub/Sub, Postgres `LISTEN/NOTIFY`, or a managed realtime service. Keep WhatsApp and other external notifications as asynchronous subscribers.
