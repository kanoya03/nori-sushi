import { isIP } from 'node:net';
import type { Request } from 'express';

function normalizeIp(value: string): string | null {
  if (value.length > 64) return null;
  if (isIP(value) === 4) return value;
  if (isIP(value) !== 6) return null;

  // URL canonicalizes IPv6, including embedded IPv4, before subnet grouping.
  const host = new URL(`http://[${value}]/`).hostname.slice(1, -1);
  const [left, right] = host.split('::');
  const head = left ? left.split(':') : [];
  const tail = right ? right.split(':') : [];
  const groups =
    right === undefined
      ? head
      : [
          ...head,
          ...Array<string>(8 - head.length - tail.length).fill('0'),
          ...tail,
        ];
  const numbers = groups.map((group) => parseInt(group, 16));
  if (
    numbers.slice(0, 5).every((part) => part === 0) &&
    numbers[5] === 0xffff
  ) {
    return [
      numbers[6] >> 8,
      numbers[6] & 255,
      numbers[7] >> 8,
      numbers[7] & 255,
    ].join('.');
  }
  // Rotating the host part of one IPv6 subnet must not create fresh quotas.
  return `${numbers
    .slice(0, 4)
    .map((part) => part.toString(16))
    .join(':')}::/64`;
}

export function clientIdentity(request: Request): string {
  // Only Render's protected ingress is allowed to supply this header.
  // Local/direct requests cannot select their identity through forwarded headers.
  if (process.env.RENDER === 'true') {
    const forwarded = request.headers['cf-connecting-ip'];
    if (typeof forwarded === 'string') {
      const normalized = normalizeIp(forwarded);
      if (normalized) return normalized;
    }
  }
  return normalizeIp(request.socket.remoteAddress ?? '') ?? 'unknown';
}
