import { describe, expect, it } from "vitest";
import type { Product } from "../types/product";
import { refreshCartItems, cartSelection } from "./refreshCart";

const product = {
  id: 1,
  price: 3000,
  name: "Roll",
  nameEn: null,
  weight: "200g",
  description: "Fish",
  descriptionEn: null,
} as Product;

describe("cart catalog reconciliation", () => {
  it("updates the price without changing quantities or mutating the original snapshot", () => {
    const original = [{ product, quantity: 2 }];
    const result = refreshCartItems(original, [{ ...product, price: 4000 }]);
    expect(result).toMatchObject({
      changed: true,
      unavailable: [],
      items: [{ quantity: 2, product: { price: 4000 } }],
    });
    expect(original[0].product.price).toBe(3000);
    expect(cartSelection(result.items)).toBe(cartSelection(original));
  });
  it("preserves unavailable selections for the customer to review", () => {
    const result = refreshCartItems([{ product, quantity: 2 }], []);
    expect(result).toMatchObject({
      changed: true,
      unavailable: [1],
      items: [{ quantity: 2, product: { id: 1, isAvailable: false } }],
    });
    expect(refreshCartItems(result.items, [product])).toMatchObject({
      changed: true,
      unavailable: [],
    });
  });
  it("does not require another confirmation when relevant product data is unchanged", () => {
    expect(
      refreshCartItems([{ product, quantity: 2 }], [{ ...product }]).changed,
    ).toBe(false);
    expect(
      refreshCartItems(
        [{ product, quantity: 2 }],
        [{ ...product, description: "New recipe" }],
      ).changed,
    ).toBe(true);
  });
});
