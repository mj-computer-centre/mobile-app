import { describe, expect, it } from 'vitest';

import {
  calendarLeaf,
  formatCountdown,
  formatDate,
  formatDateTime,
  formatDayAndDate,
  formatDistance,
  formatMinutes,
  formatMonthYear,
  formatTime,
  formatTimeTaken,
  formatWindow,
  isSameDay,
  monthGrid,
} from './format';

// Dates are built from local parts, so these tests pass in any time zone.
const morning = new Date(2026, 10, 30, 10, 0); // Monday 30 Nov 2026, 10:00
const evening = new Date(2026, 10, 30, 18, 5);
const nextDay = new Date(2026, 11, 1, 0, 30);

describe('formatTime', () => {
  it('uses a 12-hour clock with AM and PM', () => {
    expect(formatTime(morning)).toBe('10:00 AM');
    expect(formatTime(evening)).toBe('6:05 PM');
  });

  it('shows midnight and noon as 12', () => {
    expect(formatTime(nextDay)).toBe('12:30 AM');
    expect(formatTime(new Date(2026, 10, 30, 12, 0))).toBe('12:00 PM');
  });

  it('accepts an ISO string', () => {
    expect(formatTime(morning.toISOString())).toBe('10:00 AM');
  });
});

describe('dates', () => {
  it('formats a date with and without the weekday', () => {
    expect(formatDate(morning)).toBe('30 Nov 2026');
    expect(formatDayAndDate(morning)).toBe('Mon, 30 Nov');
    expect(formatDateTime(morning)).toBe('Mon, 30 Nov 2026, 10:00 AM');
  });

  it('knows when two moments fall on the same day', () => {
    expect(isSameDay(morning, evening)).toBe(true);
    expect(isSameDay(evening, nextDay)).toBe(false);
  });

  it('gives the parts of a calendar leaf', () => {
    expect(calendarLeaf(morning)).toEqual({ month: 'Nov', day: '30', weekday: 'Mon' });
  });

  it('names a month for the date picker', () => {
    expect(formatMonthYear(2026, 10)).toBe('November 2026');
  });
});

describe('formatWindow', () => {
  it('says the day once when a test starts and ends on the same day', () => {
    expect(formatWindow(morning, evening)).toBe('Mon, 30 Nov, 10:00 AM to 6:05 PM');
  });

  it('says both days when a test runs overnight', () => {
    expect(formatWindow(evening, nextDay)).toBe('Mon, 30 Nov, 6:05 PM to Tue, 1 Dec, 12:30 AM');
  });
});

describe('durations', () => {
  it('formats minutes', () => {
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(60)).toBe('1 hr');
    expect(formatMinutes(90)).toBe('1 hr 30 min');
  });

  it('formats the time a student took', () => {
    expect(formatTimeTaken(40)).toBe('40 sec');
    expect(formatTimeTaken(725)).toBe('12 min 5 sec');
    expect(formatTimeTaken(3600)).toBe('1 hr');
    expect(formatTimeTaken(3725)).toBe('1 hr 2 min');
    expect(formatTimeTaken(0)).toBe('0 sec');
  });

  it('formats the running clock', () => {
    expect(formatCountdown(65_000)).toBe('01:05');
    expect(formatCountdown(3_725_000)).toBe('1:02:05');
    expect(formatCountdown(500)).toBe('00:01');
  });

  it('never shows a negative clock', () => {
    expect(formatCountdown(-5_000)).toBe('00:00');
  });

  it('describes a distance in the largest unit that fits', () => {
    expect(formatDistance(20_000)).toBe('less than a minute');
    expect(formatDistance(60_000)).toBe('1 minute');
    expect(formatDistance(12 * 60_000)).toBe('12 minutes');
    expect(formatDistance(3 * 3_600_000)).toBe('3 hours');
    expect(formatDistance(2 * 86_400_000)).toBe('2 days');
    expect(formatDistance(-86_400_000)).toBe('1 day');
  });
});

describe('monthGrid', () => {
  it('lays out November 2026, which starts on a Sunday', () => {
    const weeks = monthGrid(2026, 10);
    expect(weeks[0]).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(weeks).toHaveLength(5);
    expect(weeks[4]).toEqual([29, 30, null, null, null, null, null]);
  });

  it('pads the first week of a month that starts midweek', () => {
    // 1 December 2026 is a Tuesday.
    expect(monthGrid(2026, 11)[0]).toEqual([null, null, 1, 2, 3, 4, 5]);
  });

  it('gives February 29 days in a leap year', () => {
    expect(monthGrid(2028, 1).flat().filter(Boolean)).toHaveLength(29);
  });

  it('always has seven days in a week', () => {
    for (let month = 0; month < 12; month += 1) {
      expect(monthGrid(2027, month).every((week) => week.length === 7)).toBe(true);
    }
  });
});
