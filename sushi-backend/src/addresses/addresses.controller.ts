import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AddressesService } from './addresses.service.js';

import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(
    private readonly addressesService:
      AddressesService,
  ) {}

  @Get()
  getAddresses(
    @Req() request: { user: { sub: number } },
  ) {
    return this.addressesService.getAddresses(
      request.user.sub,
    );
  }

  @Post()
  createAddress(
    @Req() request: { user: { sub: number } },
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressesService.createAddress(
      request.user.sub,
      dto,
    );
  }

  @Patch(':id')
  updateAddress(
    @Req() request: { user: { sub: number } },
    @Param('id', ParseIntPipe)
    addressId: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.updateAddress(
      request.user.sub,
      addressId,
      dto,
    );
  }

  @Delete(':id')
  deleteAddress(
    @Req() request: { user: { sub: number } },
    @Param('id', ParseIntPipe)
    addressId: number,
  ) {
    return this.addressesService.deleteAddress(
      request.user.sub,
      addressId,
    );
  }
}