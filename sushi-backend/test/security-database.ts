import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { vi } from 'vitest';
import type { PrismaService } from '../src/prisma/prisma.service.js';

export async function securityDatabase() {
  // Isolated PostgreSQL engine: never reads DATABASE_URL or touches Neon.
  const db = new PGlite();
  await db.exec(`
    CREATE TABLE "TelegramAuthSession" (
      "id" SERIAL PRIMARY KEY, "token" TEXT UNIQUE NOT NULL,
      "telegramId" TEXT, "code" TEXT, "expiresAt" TIMESTAMP(3) NOT NULL,
      "verified" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.exec(
    readFileSync(
      new URL(
        '../prisma/migrations/20261027120000_limit_sensitive_requests/migration.sql',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  const statement = (strings: TemplateStringsArray) =>
    strings.reduce((sql, part, i) => sql + (i ? `$${i}` : '') + part, '');
  const user = { id: 42, telegramId: '123' };
  const prisma = {
    $queryRaw: async (strings: TemplateStringsArray, ...values: unknown[]) =>
      (await db.query(statement(strings), values)).rows,
    $executeRaw: async (strings: TemplateStringsArray, ...values: unknown[]) =>
      (await db.query(statement(strings), values)).affectedRows ?? 0,
    telegramAuthSession: {
      findUnique: async ({ where }: { where: { token: string } }) =>
        (
          await db.query(
            'SELECT * FROM "TelegramAuthSession" WHERE "token" = $1',
            [where.token],
          )
        ).rows[0] ?? null,
    },
    user: {
      findUnique: vi.fn(async () => user),
      upsert: vi.fn(async () => user),
    },
  } as unknown as PrismaService;
  return { db, prisma };
}
