import { describe, expect, it } from 'vitest';
import { normalizePhoneNumber } from './phone.js';

describe('international recipient phone validation', () => {
  it.each([
    ['+7 (701) 123-45-67', '+77011234567'],
    [' +39 333 1234567 ', '+393331234567'],
    ['+1 213 373 4253', '+12133734253'],
  ])('normalizes %s to E.164', (input, expected) => {
    expect(normalizePhoneNumber(input)).toBe(expected);
  });
  it.each([
    null,
    undefined,
    123,
    '',
    '87011234567',
    '+7123',
    '+999123456789',
    '+1 222 333 3333',
    'Call +12133734253',
    '+12133734253 ext 123',
    '+'.repeat(33),
    '++77011234567',
  ])('rejects invalid input %s', (input) => {
    expect(normalizePhoneNumber(input)).toBeNull();
  });
});
