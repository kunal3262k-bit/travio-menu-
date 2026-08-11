import type { Server } from "socket.io";

/**
 * Shared socket.io instance.
 *
 * server.ts (the custom Next server) creates the Server and calls setIO().
 * API routes run in the same Node process, so the globalThis bridge lets them
 * emit events server-side instead of trusting client-triggered relays.
 * This closes the spoof vector where any browser could emit
 * new_order / order_status_updated / payment_confirmed / etc.
 */
const IO_KEY = "__SWIFTTAB_IO__";

export function setIO(io: Server) {
  (globalThis as any)[IO_KEY] = io;
}

export function getIO(): Server | undefined {
  return (globalThis as any)[IO_KEY];
}

export function emitTo(room: string, event: string, payload?: unknown) {
  const io = getIO();
  if (!io) return;
  io.to(room).emit(event, payload);
}

/**
 * A new order was created (table or car) — notify kitchen + waiter rooms.
 *
 * The kitchen/admin `kitchen_new_order` emit is gated: unpaid round-1 CAR
 * orders are hidden from the KDS by fetchGatedKitchenOrders, so they must not
 * create a kitchen alert either. The waiter `new_order` event is always sent
 * (the waiter feed intentionally includes unpaid CAR orders for payment).
 */
export function emitOrderCreated(
  restaurantId: string,
  orderId: string,
  options?: { kitchen?: boolean }
) {
  const emitKitchen = options?.kitchen !== false;
  if (emitKitchen) {
    emitTo(`kitchen_${restaurantId}`, "kitchen_new_order", { orderId });
    emitTo(`admin_${restaurantId}`, "kitchen_new_order", { orderId });
  }
  emitTo(`waiter_${restaurantId}`, "new_order", { orderId });
}

/** Kitchen/waiter advanced an order's status — push to all interested rooms. */
export function emitOrderStatusChanged(payload: {
  restaurantId: string;
  orderId: string;
  status: string;
  tableId: string | null;
}) {
  const { restaurantId, orderId, status, tableId } = payload;
  emitTo(`order_${orderId}`, "order_status_changed", { orderId, status });
  emitTo(`order_${orderId}`, "order_updated", { orderId, status });
  if (tableId) {
    emitTo(`table_${tableId}`, "table_order_status_changed", { orderId, status });
    emitTo(`table_${tableId}`, "order_updated", { orderId, status });
  }
  emitTo(`waiter_${restaurantId}`, "waiter_order_status", { orderId, status });
  emitTo(`waiter_${restaurantId}`, "order_updated", { orderId, status });
  emitTo(`admin_${restaurantId}`, "admin_order_status_changed", { orderId, status });
  emitTo(`admin_${restaurantId}`, "order_updated", { orderId, status });
  emitTo(`kitchen_${restaurantId}`, "kitchen_order_status_changed", { orderId, status });
  emitTo(`kitchen_${restaurantId}`, "order_updated", { orderId, status });
  emitTo(`car_${restaurantId}`, "order_status_updated", { orderId, status });
  emitTo(`car_${restaurantId}`, "order_updated", { orderId, status });
}

/** Customer claimed a payment (UPI submitted or cash called). */
export function emitPaymentClaimed(payload: {
  restaurantId: string;
  tableId?: string | null;
  method?: string | null;
  amountPaise?: number;
}) {
  const { restaurantId, tableId, method, amountPaise } = payload;
  emitTo(`waiter_${restaurantId}`, "payment_claimed", {
    tableId,
    method,
    amount: amountPaise,
  });
  emitTo(`admin_${restaurantId}`, "payment_claimed", {
    tableId,
    method,
    amount: amountPaise,
  });
}

/** Customer requested cash collection. */
export function emitCashRequested(payload: {
  restaurantId: string;
  tableId?: string | null;
  amountPaise?: number;
}) {
  const { restaurantId, tableId, amountPaise } = payload;
  emitTo(`waiter_${restaurantId}`, "cash_requested", { tableId, amount: amountPaise });
  emitTo(`admin_${restaurantId}`, "admin_cash_requested", { tableId, amount: amountPaise });
}

/** Staff/admin confirmed a payment — notify the customer's table/car screen + staff. */
export function emitPaymentConfirmed(payload: {
  restaurantId: string;
  tableId?: string | null;
  isCar: boolean;
}) {
  const { restaurantId, tableId, isCar } = payload;
  if (tableId) {
    emitTo(`table_${tableId}`, "payment_confirmed", { tableId });
  }
  if (isCar) {
    emitTo(`car_${restaurantId}`, "payment_confirmed", { tableId });
  }
  emitTo(`waiter_${restaurantId}`, "payment_confirmed", { tableId });
  emitTo(`admin_${restaurantId}`, "admin_payment_confirmed", { tableId });
}

/** A waiter request (call/bill) was created — push to waiter + admin rooms. */
export function emitWaiterRequestCreated(payload: {
  restaurantId: string;
  request: { id: string; type: string; tableId: string | null };
  table?: { id: string; number: number } | null;
}) {
  const { restaurantId, request, table } = payload;
  emitTo(`waiter_${restaurantId}`, "waiter_request", {
    id: request.id,
    requestType: request.type,
    tableId: request.tableId,
    table: table ?? null,
  });
  if (request.type === "CALL_WAITER") {
    emitTo(`waiter_${restaurantId}`, "waiter_called", { tableId: request.tableId });
    emitTo(`admin_${restaurantId}`, "admin_waiter_called", { tableId: request.tableId });
  } else if (request.type === "REQUEST_BILL") {
    emitTo(`waiter_${restaurantId}`, "waiter_bill_requested", { tableId: request.tableId });
    emitTo(`admin_${restaurantId}`, "admin_bill_requested", { tableId: request.tableId });
  }
}

/** A waiter request was resolved — push to waiter + admin rooms so every
 *  device drops it from its actionable alert state without a refresh. */
export function emitWaiterRequestResolved(payload: {
  restaurantId: string;
  requestId: string;
}) {
  const { restaurantId, requestId } = payload;
  emitTo(`waiter_${restaurantId}`, "waiter_request_resolved", { requestId });
  emitTo(`admin_${restaurantId}`, "waiter_request_resolved", { requestId });
}
