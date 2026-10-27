import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service.js';

import { CreateOrderDto } from './dto/create-order.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { LimitRequests, RateLimitGuard } from '../rate-limit/rate-limit.guard.js';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService:
      OrdersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @LimitRequests('user-orders')
  createOrder(
    @Req()
    request: {
      user: {
        sub: number;
      };
    },

    @Body()
    dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(
      request.user.sub,
      dto,
    );
  }

  @Post('guest')
  @UseGuards(RateLimitGuard)
  @LimitRequests('guest-orders')
  createGuestOrder(
    @Body()
    dto: CreateOrderDto,
  ) {
    return this.ordersService.createGuestOrder(
      dto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getOrders(
    @Req()
    request: {
      user: {
        sub: number;
      };
    },
  ) {
    return this.ordersService.getOrders(
      request.user.sub,
    );
  }

  @Get('guest/:id')
  getGuestOrder(
    @Param(
      'id',
      ParseIntPipe,
    )
    orderId: number,

    @Query('token')
    guestToken?: string,
  ) {
    return this.ordersService.getGuestOrder(
      orderId,
      guestToken,
    );
  }

  @Patch('guest/:id/cancel')
  cancelGuestOrder(
    @Param(
      'id',
      ParseIntPipe,
    )
    orderId: number,

    @Query('token')
    guestToken?: string,
  ) {
    return this.ordersService.cancelGuestOrder(
      orderId,
      guestToken,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOrderById(
    @Req()
    request: {
      user: {
        sub: number;
      };
    },

    @Param(
      'id',
      ParseIntPipe,
    )
    orderId: number,
  ) {
    return this.ordersService.getOrderById(
      request.user.sub,
      orderId,
    );
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelOrder(
    @Req()
    request: {
      user: {
        sub: number;
      };
    },

    @Param(
      'id',
      ParseIntPipe,
    )
    orderId: number,
  ) {
    return this.ordersService.cancelOrder(
      request.user.sub,
      orderId,
    );
  }
}
