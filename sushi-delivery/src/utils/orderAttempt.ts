import * as Crypto from "expo-crypto";
import type { CreateOrderData } from "../api/ordersApi";

type Attempt = { scope: string; signature: string; key: string };
let pendingAttempt: Attempt | null = null;

function signature(payload: Omit<CreateOrderData, "idempotencyKey">) {
  return JSON.stringify({
    ...payload,
    items: payload.items
      .map(({ productId, quantity }) => ({ productId, quantity }))
      .sort((a, b) => a.productId - b.productId),
  });
}

export function hasPendingOrderAttempt(
  scope: string,
  payload?: Omit<CreateOrderData, "idempotencyKey">,
): boolean {
  return (
    pendingAttempt?.scope === scope &&
    (!payload || pendingAttempt.signature === signature(payload))
  );
}

export function getOrderAttemptKey(
  scope: string,
  payload: Omit<CreateOrderData, "idempotencyKey">,
): string {
  const requestSignature = signature(payload);
  if (
    pendingAttempt?.scope === scope &&
    pendingAttempt.signature === requestSignature
  ) {
    return pendingAttempt.key;
  }
  const key = Crypto.randomUUID();
  pendingAttempt = { scope, signature: requestSignature, key };
  return key;
}

export function clearOrderAttemptKey(key: string): void {
  if (pendingAttempt?.key === key) pendingAttempt = null;
}
