import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

@Injectable()
export class AddressesService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async getAddresses(
    userId: number,
  ) {
    return this.prisma.address.findMany({
      where: {
        userId,
      },

      orderBy: [
        {
          isDefault: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async createAddress(
    userId: number,
    dto: CreateAddressDto,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const addressCount =
          await tx.address.count({
            where: {
              userId,
            },
          });

        const shouldBeDefault =
          dto.isDefault === true ||
          addressCount === 0;

        if (shouldBeDefault) {
          await tx.address.updateMany({
            where: {
              userId,
            },

            data: {
              isDefault: false,
            },
          });
        }

        return tx.address.create({
          data: {
            userId,

            city:
              dto.city,

            street:
              dto.street,

            house:
              dto.house,

            apartment:
              dto.apartment,

            entrance:
              dto.entrance,

            floor:
              dto.floor,

            comment:
              dto.comment,

            latitude:
              dto.latitude,

            longitude:
              dto.longitude,

            isDefault:
              shouldBeDefault,
          },
        });
      },
    );
  }

  async updateAddress(
    userId: number,
    addressId: number,
    dto: UpdateAddressDto,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const address =
          await tx.address.findFirst({
            where: {
              id:
                addressId,

              userId,
            },
          });

        if (!address) {
          throw new NotFoundException(
            'Address not found',
          );
        }

        if (
          dto.isDefault ===
          true
        ) {
          await tx.address.updateMany({
            where: {
              userId,

              id: {
                not:
                  addressId,
              },
            },

            data: {
              isDefault:
                false,
            },
          });
        }

        return tx.address.update({
          where: {
            id:
              addressId,
          },

          data: {
            city:
              dto.city,

            street:
              dto.street,

            house:
              dto.house,

            apartment:
              dto.apartment,

            entrance:
              dto.entrance,

            floor:
              dto.floor,

            comment:
              dto.comment,

            latitude:
              dto.latitude,

            longitude:
              dto.longitude,

            isDefault:
              dto.isDefault,
          },
        });
      },
    );
  }

  async deleteAddress(
    userId: number,
    addressId: number,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const address =
          await tx.address.findFirst({
            where: {
              id:
                addressId,

              userId,
            },
          });

        if (!address) {
          throw new NotFoundException(
            'Address not found',
          );
        }

        await tx.address.delete({
          where: {
            id:
              addressId,
          },
        });

        if (address.isDefault) {
          const nextAddress =
            await tx.address.findFirst({
              where: {
                userId,
              },

              orderBy: {
                createdAt:
                  'desc',
              },
            });

          if (nextAddress) {
            await tx.address.update({
              where: {
                id:
                  nextAddress.id,
              },

              data: {
                isDefault:
                  true,
              },
            });
          }
        }

        return {
          success: true,
        };
      },
    );
  }
}