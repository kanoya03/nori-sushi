import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AddressesController } from './addresses.controller.js';
import { AddressesService } from './addresses.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],

  controllers: [
    AddressesController,
  ],

  providers: [
    AddressesService,
    JwtAuthGuard,
  ],
})
export class AddressesModule {}