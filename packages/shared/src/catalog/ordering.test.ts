import { describe, expect, it } from 'vitest';

import { moveItem } from './ordering';

describe('moveItem', () => {
  const units = ['Fundamentals', 'Paint', 'Word', 'Excel'];

  it('moves an item up and down', () => {
    expect(moveItem(units, 2, 1)).toEqual(['Fundamentals', 'Word', 'Paint', 'Excel']);
    expect(moveItem(units, 0, 3)).toEqual(['Paint', 'Word', 'Excel', 'Fundamentals']);
  });

  it('leaves the list alone for moves past either end', () => {
    expect(moveItem(units, 0, -1)).toEqual(units);
    expect(moveItem(units, 3, 4)).toEqual(units);
  });

  it('never changes the original list', () => {
    const original = [...units];
    moveItem(units, 1, 2);
    expect(units).toEqual(original);
  });
});
