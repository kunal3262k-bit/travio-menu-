import { describe, expect, it, vi, beforeEach } from "vitest";
import { emitOrderStatusChanged, setIO } from "../src/shared/utils/socket";
import { isPaymentConfirmationAllowedRole } from "../src/shared/utils/staffAuth";

vi.mock("../src/shared/utils/auth", () => ({
  requireSession: vi.fn(),
}));

describe("payment confirmation role checks", () => {
  it("allows admin, waiter, and kitchen roles", () => {
    expect(isPaymentConfirmationAllowedRole("ADMIN")).toBe(true);
    expect(isPaymentConfirmationAllowedRole("WAITER")).toBe(true);
    expect(isPaymentConfirmationAllowedRole("KITCHEN")).toBe(true);
  });

  it("rejects unauthorized roles", () => {
    expect(isPaymentConfirmationAllowedRole("CUSTOMER")).toBe(false);
    expect(isPaymentConfirmationAllowedRole(undefined)).toBe(false);
  });
});

describe("socket order status broadcasts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("emits both legacy and updated event names for order status changes", () => {
    const emitted: Array<{ room: string; event: string; payload?: unknown }> = [];
    const mockIo = {
      to: vi.fn((room: string) => ({
        emit: (event: string, payload?: unknown) => {
          emitted.push({ room, event, payload });
        },
      })),
    };

    setIO(mockIo as any);

    emitOrderStatusChanged({
      restaurantId: "rest-1",
      orderId: "order-1",
      status: "READY",
      tableId: "table-1",
    });

    expect(emitted).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ room: "order_order-1", event: "order_status_changed" }),
        expect.objectContaining({ room: "order_order-1", event: "order_updated" }),
      ])
    );
  });
});
