import type { Product } from '../types/product';

export function filterProducts(
  products: Product[],
  categorySlug: string | null,
  query: string,
): Product[] {
  const search = query.trim().toLocaleLowerCase();
  return products.filter((product) => {
    if (categorySlug && product.categorySlug !== categorySlug) {
      return false;
    }
    // Search both catalog languages so changing language preserves useful results.
    return (
      !search ||
      [product.name, product.nameEn, product.description, product.descriptionEn].some((value) =>
        value?.toLocaleLowerCase().includes(search),
      )
    );
  });
}
