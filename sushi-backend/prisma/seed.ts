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
        'https://tako-sushi.mk.ua/wp-content/uploads/2024/01/rol%D1%8B-800h800-filadelfiya.jpg',

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
        'https://online-sushi.com.ua/image/catalog/interesnaya-informaciya-o-rollah-kaliforniya.jpg',

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
        'https://royal-vip.com.ua/wp-content/uploads/2021/02/bronzov-drakon-sajt.jpg',

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
        'https://rocosushi.com/uploads/products/994b0b74d9cc0921fef3-%D0%A1%D0%B5%D1%82-4-%D1%81%D1%82%D0%BE%D0%BB-new.jpg',

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
        'https://image.vsem-edu-oblako.ru/upload/store/merchant4146/setsemeinyi0011737526098.jpg?h=675&w=900',

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
        'https://sushi-reutov.ru/wp-content/uploads/2022/11/Zapech-losos1080x720-1080x720-1.jpg',

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
        'https://povaryeshka.by/wp-content/uploads/2024/06/zapechennye-rolly-s-krevetkami.png',

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
        'https://chefcafe.by/pictures/product/big/5559_big.png',

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
        'https://yapiko.ua/media/catalog/product/cache/90c631851bfc82ed3538a672fa9488bb/t/e/tempura_roll_with_shrimp_and_salmon.jpg',

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
        'https://higasi.ru/image/cache/catalog/sushisjake-700x562.jpg',

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
        'https://png.klev.club/uploads/posts/2024-04/png-klev-club-k686-p-banka-koli-png-10.png',

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
        'https://kupivody.ru/wp-content/uploads/2021/12/fanta-orange-033.jpg',

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

            description:
              product.description,

            descriptionEn:
              product.descriptionEn,

            price:
              product.price,

            weight:
              product.weight,

            imageUrl:
              product.imageUrl,

            categoryId:
              product.categoryId,
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