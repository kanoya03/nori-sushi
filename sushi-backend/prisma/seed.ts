import 'dotenv/config';

import {
  PrismaPg,
} from '@prisma/adapter-pg';

import {
  PrismaClient,
} from '../src/generated/prisma/client.js';

const adapter =
  new PrismaPg({
    connectionString:
      process.env.DATABASE_URL!,
  });

const prisma =
  new PrismaClient({
    adapter,
  });

async function main() {
  const rolls =
    await prisma.category.upsert({
      where: {
        slug: 'rolls',
      },

      update: {
        nameEn: 'Rolls',
      },

      create: {
        name: 'Роллы',
        nameEn: 'Rolls',
        slug: 'rolls',
      },
    });

  const sets =
    await prisma.category.upsert({
      where: {
        slug: 'sets',
      },

      update: {
        nameEn: 'Sets',
      },

      create: {
        name: 'Сеты',
        nameEn: 'Sets',
        slug: 'sets',
      },
    });

  const baked =
    await prisma.category.upsert({
      where: {
        slug: 'baked',
      },

      update: {
        nameEn: 'Baked Rolls',
      },

      create: {
        name: 'Запечённые',
        nameEn: 'Baked Rolls',
        slug: 'baked',
      },
    });

  const tempura =
    await prisma.category.upsert({
      where: {
        slug: 'tempura',
      },

      update: {
        nameEn: 'Tempura',
      },

      create: {
        name: 'Темпура',
        nameEn: 'Tempura',
        slug: 'tempura',
      },
    });

  const sushi =
    await prisma.category.upsert({
      where: {
        slug: 'sushi',
      },

      update: {
        nameEn: 'Sushi',
      },

      create: {
        name: 'Суши',
        nameEn: 'Sushi',
        slug: 'sushi',
      },
    });

  const drinks =
    await prisma.category.upsert({
      where: {
        slug: 'drinks',
      },

      update: {
        nameEn: 'Drinks',
      },

      create: {
        name: 'Напитки',
        nameEn: 'Drinks',
        slug: 'drinks',
      },
    });

  const products = [
    {
      name: 'Филадельфия',
      nameEn: 'Philadelphia',

      description:
        'Лосось, сливочный сыр, огурец',

      descriptionEn:
        'Salmon, cream cheese, cucumber',

      price: 4290,
      weight: '250 г',

      imageUrl:
        'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',

      categoryId:
        rolls.id,
    },

    {
      name: 'Калифорния',
      nameEn: 'California',

      description:
        'Краб, авокадо, огурец, икра тобико',

      descriptionEn:
        'Crab, avocado, cucumber, tobiko',

      price: 3490,
      weight: '230 г',

      imageUrl:
        'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',

      categoryId:
        rolls.id,
    },

    {
      name: 'Дракон',
      nameEn: 'Dragon',

      description:
        'Угорь, авокадо, огурец, соус унаги',

      descriptionEn:
        'Eel, avocado, cucumber, unagi sauce',

      price: 4590,
      weight: '260 г',

      imageUrl:
        'https://images.unsplash.com/photo-1611143669185-af224c5e3252',

      categoryId:
        rolls.id,
    },

    {
      name: 'Сет Tokyo',
      nameEn: 'Tokyo Set',

      description:
        'Филадельфия, Калифорния, Сяке маки',

      descriptionEn:
        'Philadelphia, California, sake maki',

      price: 12990,
      weight: '900 г',

      imageUrl:
        'https://images.unsplash.com/photo-1553621042-f6e147245754',

      categoryId:
        sets.id,
    },

    {
      name: 'Сет Family',
      nameEn: 'Family Set',

      description:
        'Большой сет для компании',

      descriptionEn:
        'Large set for sharing',

      price: 14990,
      weight: '1200 г',

      imageUrl:
        'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56',

      categoryId:
        sets.id,
    },

    {
      name:
        'Запечённый лосось',

      nameEn:
        'Baked Salmon Roll',

      description:
        'Лосось, сливочный сыр, сырный соус',

      descriptionEn:
        'Salmon, cream cheese, cheese sauce',

      price: 3890,
      weight: '270 г',

      imageUrl:
        'https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db',

      categoryId:
        baked.id,
    },

    {
      name:
        'Запечённая креветка',

      nameEn:
        'Baked Shrimp Roll',

      description:
        'Креветка, сырный соус, огурец',

      descriptionEn:
        'Shrimp, cheese sauce, cucumber',

      price: 3690,
      weight: '260 г',

      imageUrl:
        'https://images.unsplash.com/photo-1563612116625-3012372fccce',

      categoryId:
        baked.id,
    },

    {
      name:
        'Темпура с лососем',

      nameEn:
        'Salmon Tempura Roll',

      description:
        'Лосось, сливочный сыр, темпура',

      descriptionEn:
        'Salmon, cream cheese, tempura',

      price: 3990,
      weight: '280 г',

      imageUrl:
        'https://images.unsplash.com/photo-1615361200141-f45040f367be',

      categoryId:
        tempura.id,
    },

    {
      name:
        'Темпура с креветкой',

      nameEn:
        'Shrimp Tempura Roll',

      description:
        'Креветка, авокадо, темпура',

      descriptionEn:
        'Shrimp, avocado, tempura',

      price: 3890,
      weight: '280 г',

      imageUrl:
        'https://images.unsplash.com/photo-1607301405390-d831c242f59b',

      categoryId:
        tempura.id,
    },

    {
      name: 'Сяке',
      nameEn: 'Sake',

      description:
        'Лосось, рис',

      descriptionEn:
        'Salmon, rice',

      price: 1290,
      weight: '70 г',

      imageUrl:
        'https://images.unsplash.com/photo-1583623025817-d180a2221d0a',

      categoryId:
        sushi.id,
    },

    {
      name: 'Эби',
      nameEn: 'Ebi',

      description:
        'Креветка, рис',

      descriptionEn:
        'Shrimp, rice',

      price: 1190,
      weight: '70 г',

      imageUrl:
        'https://images.unsplash.com/photo-1558985212-92c2ff0b56e7',

      categoryId:
        sushi.id,
    },

    {
      name: 'Coca-Cola',
      nameEn: 'Coca-Cola',

      description:
        'Газированный напиток',

      descriptionEn:
        'Carbonated soft drink',

      price: 790,
      weight: '500 мл',

      imageUrl:
        'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',

      categoryId:
        drinks.id,
    },

    {
      name: 'Fanta',
      nameEn: 'Fanta',

      description:
        'Апельсиновый газированный напиток',

      descriptionEn:
        'Orange carbonated soft drink',

      price: 790,
      weight: '500 мл',

      imageUrl:
        'https://images.unsplash.com/photo-1624517452488-04869289c4ca',

      categoryId:
        drinks.id,
    },
  ];

  for (
    const product of products
  ) {
    const existing =
      await prisma.product
        .findFirst({
          where: {
            name:
              product.name,
          },
        });

    if (existing) {
      await prisma.product
        .update({
          where: {
            id:
              existing.id,
          },

          data: {
            nameEn:
              product.nameEn,

            descriptionEn:
              product.descriptionEn,
          },
        });

      continue;
    }

    await prisma.product
      .create({
        data: product,
      });
  }
}

main()
  .then(async () => {
    console.log(
      'Seed completed'
    );

    await prisma
      .$disconnect();
  })
  .catch(async (error) => {
    console.error(
      error
    );

    await prisma
      .$disconnect();

    process.exit(1);
  });