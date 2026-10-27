import type {
  Product,
} from '../types/product';

export type ApiCategory = {
  id: number;

  name: string;
  nameEn: string | null;

  slug: string;
};

export type ApiProduct = {
  id: number;

  name: string;
  nameEn: string | null;

  description: string;
  descriptionEn: string | null;

  price: number;
  weight: string;
  imageUrl: string;

  isAvailable?: boolean;

  categoryId: number;

  category: ApiCategory;
};

export const mapApiProduct = (
  product: ApiProduct
): Product => ({
  isAvailable: product.isAvailable !== false,
  id:
    product.id,

  name:
    product.name,

  nameEn:
    product.nameEn,

  description:
    product.description,

  descriptionEn:
    product.descriptionEn,

  price:
    product.price,

  weight:
    product.weight,

  image:
    product.imageUrl,

  categoryId:
    product.categoryId,

  category:
    product.category.name,

  categoryEn:
    product.category.nameEn,

  categorySlug:
    product.category.slug,
});
