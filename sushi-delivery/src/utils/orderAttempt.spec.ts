import { describe, expect, it, vi } from "vitest";
import type { CreateOrderData } from "../api/ordersApi";
vi.mock("expo-crypto", () => ({
  randomUUID: vi
    .fn()
    .mockReturnValueOnce("first-key")
    .mockReturnValueOnce("second-key"),
}));
import {
  getOrderAttemptKey,
  hasPendingOrderAttempt,
  clearOrderAttemptKey,
} from "./orderAttempt";

describe("retrying checkout after an uncertain response", () => {
  it("retains the attempt key when only quoted prices changed", () => {
    const payload: Omit<CreateOrderData, "idempotencyKey"> = {
      recipientPhone: "+77011234567",
      deliveryType: "DELIVERY",
      paymentMethod: "CASH",
      address: "Street 1",
      items: [{ productId: 1, quantity: 2, expectedUnitPrice: 3000 }],
    };
    const key = getOrderAttemptKey("guest", payload);
    const refreshed = {
      ...payload,
      items: [{ productId: 1, quantity: 2, expectedUnitPrice: 4000 }],
    };
    expect(hasPendingOrderAttempt("guest", refreshed)).toBe(true);
    expect(getOrderAttemptKey("guest", refreshed)).toBe(key);
    expect(hasPendingOrderAttempt("user:1", refreshed)).toBe(false);
    expect(
      getOrderAttemptKey("guest", {
        ...refreshed,
        items: [{ productId: 1, quantity: 3, expectedUnitPrice: 4000 }],
      }),
    ).not.toBe(key);
    clearOrderAttemptKey("second-key");
    expect(hasPendingOrderAttempt("guest")).toBe(false);
  });
});
