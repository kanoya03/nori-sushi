export type Product = {
  id: number;

  name: string;
  nameEn: string | null;

  description: string;
  descriptionEn: string | null;

  price: number;
  weight: string;
  image: string;

  categoryId: number;
  category: string;
  categoryEn: string | null;
  categorySlug: string;
};
