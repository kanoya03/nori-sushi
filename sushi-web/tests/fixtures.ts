// Representative API responses, used only by automated tests. The app has no fixture imports.
import type { ApiProduct } from '../src/api/productMapper';

export const categories = [
  { id: 1, name: 'Роллы', nameEn: 'Rolls', slug: 'rolls' },
  { id: 6, name: 'Напитки', nameEn: 'Drinks', slug: 'drinks' },
];

export const products: ApiProduct[] = [
  {
    id: 1,
    name: 'Филадельфия',
    nameEn: 'Philadelphia',
    description: 'Лосось, сливочный сыр, огурец',
    descriptionEn: 'Salmon, cream cheese, cucumber',
    price: 4290,
    weight: '250 г',
    imageUrl: 'https://images.example.test/philadelphia.svg',
    categoryId: 1,
    category: categories[0],
    isAvailable: true,
  },
  {
    id: 2,
    name: 'Калифорния',
    nameEn: null,
    description: 'Краб, авокадо, огурец, икра тобико',
    descriptionEn: null,
    price: 3490,
    weight: '230 г',
    imageUrl: 'https://images.example.test/california.svg',
    categoryId: 1,
    category: categories[0],
    isAvailable: true,
  },
  {
    id: 13,
    name: 'Напиток',
    nameEn: 'Drink',
    description: 'Прохладный напиток',
    descriptionEn: 'A cool drink',
    price: 690,
    weight: '500 мл',
    imageUrl: 'https://images.example.test/drink.svg',
    categoryId: 6,
    category: categories[1],
    isAvailable: true,
  },
];
