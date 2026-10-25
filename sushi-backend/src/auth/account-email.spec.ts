import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { JwtService } from '@nestjs/jwt';

const verifyIdToken = vi.hoisted(() => vi.fn());

vi.mock('google-auth-library', () => ({
  OAuth2Client: class {
    verifyIdToken = verifyIdToken;
  },
}));

type TestUser = {
  id: number;
  googleId: string | null;
  telegramId: string | null;
  email: string | null;
  contactEmail: string | null;
};

function createServices(existingUsers: TestUser[] = []) {
  const users = [...existingUsers];
  const findUnique = vi.fn(
    async ({ where }: { where: { googleId?: string } }) =>
      users.find((user) => user.googleId === where.googleId) ?? null,
  );
  const create = vi.fn(
    async ({ data }: { data: Omit<TestUser, 'id' | 'telegramId'> }) => {
      const user = { id: users.length + 1, telegramId: null, ...data };
      users.push(user);
      return user;
    },
  );
  const update = vi.fn(
    async ({
      where,
      data,
    }: {
      where: { id: number };
      data: Partial<TestUser>;
    }) => {
      const user = users.find((entry) => entry.id === where.id)!;
      Object.assign(user, data);
      return user;
    },
  );
  const prisma = {
    user: { findUnique, create, update },
  } as unknown as PrismaService;
  const jwt = {
    signAsync: vi.fn(async () => 'signed-token'),
  } as unknown as JwtService;
  return {
    users,
    findUnique,
    create,
    update,
    auth: new AuthService(prisma, jwt),
    profile: new UsersService(prisma),
  };
}

function googleIdentity(email: string, verified = true) {
  verifyIdToken.mockResolvedValue({
    getPayload: () => ({ sub: 'google-123', email, email_verified: verified }),
  });
}

describe('separate sign-in and contact email', () => {
  beforeEach(() => {
    vi.stubEnv('GOOGLE_WEB_CLIENT_ID', 'test-client-id');
    verifyIdToken.mockReset();
  });

  it('creates a Google account with both emails populated', async () => {
    googleIdentity(' Person@Example.test ');
    const { auth, users } = createServices();

    const result = await auth.verifyGoogleToken('valid-token');

    expect(result.user).toMatchObject({
      googleId: 'google-123',
      email: 'person@example.test',
      contactEmail: 'person@example.test',
    });
    expect(users).toHaveLength(1);
  });

  it('never joins a Telegram account through its editable contact email', async () => {
    googleIdentity('victim@example.test');
    const attacker: TestUser = {
      id: 1,
      googleId: null,
      telegramId: 'attacker-telegram',
      email: null,
      contactEmail: 'victim@example.test',
    };
    const { auth, users, findUnique } = createServices([attacker]);

    const result = await auth.verifyGoogleToken('valid-token');

    expect(result.user.id).toBe(2);
    expect(users[0].googleId).toBeNull();
    expect(users[1].telegramId).toBeNull();
    expect(findUnique).toHaveBeenCalledTimes(1);
    expect(findUnique).toHaveBeenCalledWith({
      where: { googleId: 'google-123' },
    });
  });

  it('preserves an edited contact email on later Google sign-ins', async () => {
    googleIdentity('new-primary@example.test');
    const { auth, users } = createServices([
      {
        id: 1,
        googleId: 'google-123',
        telegramId: null,
        email: 'old-primary@example.test',
        contactEmail: 'preferred@example.test',
      },
    ]);

    const result = await auth.verifyGoogleToken('valid-token');

    expect(result.user.id).toBe(1);
    expect(users).toHaveLength(1);
    expect(result.user).toMatchObject({
      email: 'new-primary@example.test',
      contactEmail: 'preferred@example.test',
    });
  });

  it('requires Google to confirm the sign-in email', async () => {
    googleIdentity('unverified@example.test', false);
    const { auth, create } = createServices();

    await expect(auth.verifyGoogleToken('valid-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('lets profile edits change only the contact email and clear it', async () => {
    const { profile, users } = createServices([
      {
        id: 1,
        googleId: 'google-123',
        telegramId: null,
        email: 'primary@example.test',
        contactEmail: 'old@example.test',
      },
    ]);

    await profile.updateCurrentUser(1, { contactEmail: ' NEW@Example.test ' });
    expect(users[0]).toMatchObject({
      email: 'primary@example.test',
      contactEmail: 'new@example.test',
    });

    await profile.updateCurrentUser(1, { contactEmail: null });
    expect(users[0].contactEmail).toBeNull();
    expect(users[0].email).toBe('primary@example.test');
  });

  it('rejects a direct API attempt to edit the sign-in email', async () => {
    const { profile, update } = createServices();

    await expect(
      profile.updateCurrentUser(1, { email: 'attacker@example.test' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(update).not.toHaveBeenCalled();
  });
});
