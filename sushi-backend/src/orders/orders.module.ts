import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],

  controllers: [
    OrdersController,
  ],

  providers: [
    OrdersService,
    JwtAuthGuard,
  ],
})
export class OrdersModule {}