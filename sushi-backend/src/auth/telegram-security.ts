import { HttpException, HttpStatus } from '@nestjs/common';

export const MAX_TELEGRAM_FAILURES = 5;
export const SESSION_TOKEN_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function telegramSessionLocked(): HttpException {
  return new HttpException(
    {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      code: 'TELEGRAM_SESSION_LOCKED',
      message: 'Too many incorrect codes. Start Telegram sign-in again.',
    },
    HttpStatus.TOO_MANY_REQUESTS,
  );
}
