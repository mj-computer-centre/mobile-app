import { describe, expect, it } from 'vitest';

import { AppError, toAppError } from './errors';

describe('toAppError', () => {
  it('reads the code a database function raised', () => {
    const error = toAppError({ message: 'mcc:last_owner', code: 'P0001' });
    expect(error.code).toBe('last_owner');
    expect(error.message).toMatch(/at least one owner/);
  });

  it('recognises a dropped connection', () => {
    expect(toAppError(new TypeError('Network request failed')).code).toBe('network');
  });

  it('keeps an AppError as it is', () => {
    const original = new AppError('owner_only');
    expect(toAppError(original)).toBe(original);
  });

  it('falls back to unknown for codes it does not know', () => {
    expect(toAppError({ message: 'mcc:something_new' }).code).toBe('unknown');
    expect(toAppError('boom').code).toBe('unknown');
  });
});
