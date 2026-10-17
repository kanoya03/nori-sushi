import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProductsModule } from './products/products.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { AddressesModule } from './addresses/addresses.module.js';
import { OrdersModule } from './orders/orders.module.js';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    ProductsModule,
    AuthModule,
    UsersModule,
    FavoritesModule,
    AddressesModule,
    OrdersModule,
  ],
})
export class AppModule {}