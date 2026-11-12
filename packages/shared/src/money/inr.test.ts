import { describe, expect, it } from 'vitest';

import { discountPercent, formatInr, rupeesToPaise } from './inr';

describe('formatInr', () => {
  it.each([
    [0, '₹0'],
    [100, '₹1'],
    [1050, '₹10.50'],
    [299900, '₹2,999'],
    [1499900, '₹14,999'],
    [14999900, '₹1,49,999'],
    [1000000000, '₹1,00,00,000'],
    [-299900, '-₹2,999'],
  ])('%i paise shows as %s', (paise, text) => {
    expect(formatInr(paise)).toBe(text);
  });
});

describe('rupeesToPaise', () => {
  it('avoids floating-point drift', () => {
    expect(rupeesToPaise(14999)).toBe(1499900);
    expect(rupeesToPaise(19.99)).toBe(1999);
  });
});

describe('discountPercent', () => {
  it('is 100 for a free course with an original price', () => {
    expect(discountPercent(1499900, 0)).toBe(100);
  });

  it('rounds to a whole number', () => {
    expect(discountPercent(299900, 199900)).toBe(33);
  });

  it('is null when there is nothing to show', () => {
    expect(discountPercent(null, 0)).toBeNull();
    expect(discountPercent(0, 0)).toBeNull();
    expect(discountPercent(100000, 100000)).toBeNull();
  });
});
