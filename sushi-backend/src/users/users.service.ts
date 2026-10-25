import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateCurrentUser(userId: number, dto: UpdateProfileDto) {
    if (!dto || typeof dto !== 'object' || 'email' in dto) {
      throw new BadRequestException(
        'Sign-in email cannot be edited in the profile',
      );
    }

    let contactEmail: string | null | undefined;
    if (dto.contactEmail !== undefined) {
      if (dto.contactEmail !== null && typeof dto.contactEmail !== 'string') {
        throw new BadRequestException('Invalid contact email');
      }

      contactEmail = dto.contactEmail?.trim().toLowerCase() || null;
      if (
        contactEmail &&
        (contactEmail.length > 254 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
      ) {
        throw new BadRequestException('Invalid contact email');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },

      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        contactEmail,
      },
    });
  }
}
