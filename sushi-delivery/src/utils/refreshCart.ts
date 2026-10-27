import type { CartItem } from "../types/cart";
import type { Product } from "../types/product";

export function cartSelection(items: CartItem[]): string {
  return JSON.stringify(
    items
      .map((item) => [item.product.id, item.quantity])
      .sort((a, b) => a[0] - b[0]),
  );
}

export function refreshCartItems(items: CartItem[], products: Product[]) {
  const byId = new Map(
    products
      .filter((product) => product.isAvailable !== false)
      .map((product) => [product.id, product]),
  );
  let changed = false;
  const unavailable: number[] = [];
  const refreshed = items.map((item) => {
    const fresh = byId.get(item.product.id);
    if (!fresh) {
      unavailable.push(item.product.id);
      changed = true;
      return { ...item, product: { ...item.product, isAvailable: false } };
    }
    const previous = item.product;
    if (
      previous.isAvailable === false ||
      [
        "price",
        "name",
        "nameEn",
        "weight",
        "description",
        "descriptionEn",
      ].some(
        (key) => previous[key as keyof Product] !== fresh[key as keyof Product],
      )
    )
      changed = true;
    return { ...item, product: fresh };
  });
  return { items: refreshed, changed, unavailable };
}
