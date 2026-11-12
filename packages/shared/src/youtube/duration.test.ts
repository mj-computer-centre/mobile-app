import { describe, expect, it } from 'vitest';

import { formatDuration, parseIsoDuration } from './duration';

describe('parseIsoDuration', () => {
  it.each([
    ['PT4M56S', 296],
    ['PT9M22S', 562],
    ['PT1H2M3S', 3723],
    ['PT45S', 45],
    ['PT2H', 7200],
    ['P1DT2H', 93600],
    ['P0D', 0],
  ])('%s is %i seconds', (input, seconds) => {
    expect(parseIsoDuration(input)).toBe(seconds);
  });

  it.each(['', 'P', 'PT', '4:56', 'PT4M56'])('rejects %s', (input) => {
    expect(parseIsoDuration(input)).toBeNull();
  });
});

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [9, '0:09'],
    [296, '4:56'],
    [3723, '1:02:03'],
    [-5, '0:00'],
  ])('%i seconds shows as %s', (seconds, text) => {
    expect(formatDuration(seconds)).toBe(text);
  });
});
