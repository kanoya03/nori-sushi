import 'dotenv/config';

import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import {
  PrismaClient,
} from '../generated/prisma/client.js';

import {
  PrismaPg,
} from '@prisma/adapter-pg';

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not configured',
  );
}

const adapter =
  new PrismaPg({
    connectionString:
      databaseUrl,
  });

@Injectable()
export class PrismaService
  extends PrismaClient
  implements
    OnModuleInit,
    OnModuleDestroy
{
  constructor() {
    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}