import { describe, expect, it } from 'vitest';

import { formatIndianMobile, normalizeIndianMobile } from './phone';

describe('normalizeIndianMobile', () => {
  it.each(['9876543210', '98765 43210', '+91 98765-43210', '919876543210', '09876543210'])(
    'accepts %s',
    (input) => {
      expect(normalizeIndianMobile(input)).toBe('9876543210');
    },
  );

  it.each(['', '12345', '5876543210', '98765432101', '+1 415 555 0100'])('rejects %s', (input) => {
    expect(normalizeIndianMobile(input)).toBeNull();
  });
});

describe('formatIndianMobile', () => {
  it('groups five and five', () => {
    expect(formatIndianMobile('9876543210')).toBe('98765 43210');
  });
});
