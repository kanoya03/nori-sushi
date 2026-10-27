export const RATE_LIMIT_POLICIES = {
  'guest-orders': {
    identity: 'ip',
    windows: [
      { limit: 10, seconds: 600 },
      { limit: 30, seconds: 3600 },
    ],
  },
  'user-orders': {
    identity: 'user',
    windows: [
      { limit: 10, seconds: 600 },
      { limit: 30, seconds: 3600 },
    ],
  },
  'telegram-start': {
    identity: 'ip',
    windows: [
      { limit: 5, seconds: 60 },
      { limit: 20, seconds: 3600 },
    ],
  },
  'telegram-verify': { identity: 'ip', windows: [{ limit: 20, seconds: 60 }] },
  'google-auth': { identity: 'ip', windows: [{ limit: 20, seconds: 60 }] },
  'telegram-bot': {
    identity: 'telegram',
    windows: [
      { limit: 5, seconds: 60 },
      { limit: 20, seconds: 3600 },
    ],
  },
} as const;

export type RateLimitPolicy = keyof typeof RATE_LIMIT_POLICIES;
