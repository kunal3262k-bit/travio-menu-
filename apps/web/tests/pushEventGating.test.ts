import { beforeEach, describe, expect, it, vi } from "vitest";

// The push sender is mocked so these tests verify the socket-level gating
// decisions (which events produce a push, which are gated off) without
// touching web-push or the database.
vi.mock("../src/shared/utils/push", () => ({
  firePush: vi.fn(),
}));

const { firePush } = await import("../src/shared/utils/push");
const {
  emitOrderCreated,
  emitPaymentClaimed,
  emitPaymentConfirmed,
  emitWaiterRequestCreated,
} = await import("../src/shared/utils/socket");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("emitOrderCreated push gating", () => {
  it("table order -> kitchen Web Push with order tag", () => {
    emitOrderCreated("rest-1", "order-abc");
    expect(firePush).toHaveBeenCalledTimes(1);
    expect(firePush).toHaveBeenCalledWith(
      { restaurantId: "rest-1", roles: ["KITCHEN"] },
      expect.objectContaining({ tag: "new-order-order-abc" })
    );
  });

  it("unpaid CAR round-1 (kitchen: false) -> NO kitchen push", () => {
    emitOrderCreated("rest-1", "car-order-1", { kitchen: false });
    expect(firePush).not.toHaveBeenCalled();
  });

  it("paid CAR round-2 (kitchen: true) -> kitchen push", () => {
    emitOrderCreated("rest-1", "car-order-2", { kitchen: true });
    expect(firePush).toHaveBeenCalledTimes(1);
    expect(firePush).toHaveBeenCalledWith(
      { restaurantId: "rest-1", roles: ["KITCHEN"] },
      expect.objectContaining({ tag: "new-order-car-order-2" })
    );
  });
});

describe("emitWaiterRequestCreated push", () => {
  it("CALL_WAITER -> waiter push naming the table", () => {
    emitWaiterRequestCreated({
      restaurantId: "rest-1",
      request: { id: "req-1", type: "CALL_WAITER", tableId: "t-1" },
      table: { id: "t-1", number: 4 },
    });
    expect(firePush).toHaveBeenCalledTimes(1);
    expect(firePush).toHaveBeenCalledWith(
      { restaurantId: "rest-1", roles: ["WAITER"] },
      expect.objectContaining({ tag: "request-req-1", title: "🙋 Waiter Call", body: "Waiter requested at Table 4." })
    );
  });

  it("REQUEST_BILL -> waiter push naming the table", () => {
    emitWaiterRequestCreated({
      restaurantId: "rest-1",
      request: { id: "req-2", type: "REQUEST_BILL", tableId: "t-2" },
      table: { id: "t-2", number: 7 },
    });
    expect(firePush).toHaveBeenCalledTimes(1);
    expect(firePush).toHaveBeenCalledWith(
      { restaurantId: "rest-1", roles: ["WAITER"] },
      expect.objectContaining({ tag: "request-req-2", title: "🧾 Bill Requested", body: "Bill requested at Table 7." })
    );
  });

  it("does not push for unknown request types", () => {
    emitWaiterRequestCreated({
      restaurantId: "rest-1",
      request: { id: "req-3", type: "OTHER", tableId: null },
    });
    expect(firePush).not.toHaveBeenCalled();
  });
});

describe("payment push", () => {
  it("emitPaymentClaimed -> waiter push", () => {
    emitPaymentClaimed({ restaurantId: "rest-1", tableId: "t-1", method: "UPI" });
    expect(firePush).toHaveBeenCalledTimes(1);
    expect(firePush).toHaveBeenCalledWith(
      { restaurantId: "rest-1", roles: ["WAITER"] },
      expect.objectContaining({ tag: "payment-claim-t-1" })
    );
  });

  it("emitPaymentClaimed (car, no table) -> waiter push with car tag", () => {
    emitPaymentClaimed({ restaurantId: "rest-1", method: "CASH" });
    expect(firePush).toHaveBeenCalledWith(
      { restaurantId: "rest-1", roles: ["WAITER"] },
      expect.objectContaining({ tag: "payment-claim-car" })
    );
  });

  it("emitPaymentConfirmed -> waiter push", () => {
    emitPaymentConfirmed({ restaurantId: "rest-1", tableId: "t-2", isCar: false });
    expect(firePush).toHaveBeenCalledTimes(1);
    expect(firePush).toHaveBeenCalledWith(
      { restaurantId: "rest-1", roles: ["WAITER"] },
      expect.objectContaining({ tag: "payment-confirmed-t-2", title: "✅ Payment Confirmed" })
    );
  });
});
