/**
 * Dates and durations as the app shows them, in the phone's own time zone. Written by hand
 * (like money/inr.ts) so the wording is identical on Hermes, in browsers and in tests instead
 * of depending on each engine's Intl data.
 */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export type DateInput = Date | string | number;

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "10:00 AM", "6:05 PM". */
export function formatTime(value: DateInput): string {
  const date = toDate(value);
  const hours = date.getHours();
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${pad(date.getMinutes())} ${hours < 12 ? 'AM' : 'PM'}`;
}

/** "30 Nov 2026". */
export function formatDate(value: DateInput): string {
  const date = toDate(value);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "Mon, 30 Nov": the year is left out, for dates close to today. */
export function formatDayAndDate(value: DateInput): string {
  const date = toDate(value);
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** "Mon, 30 Nov 2026, 10:00 AM". */
export function formatDateTime(value: DateInput): string {
  const date = toDate(value);
  return `${formatDayAndDate(date)} ${date.getFullYear()}, ${formatTime(date)}`;
}

export function isSameDay(a: DateInput, b: DateInput): boolean {
  const first = toDate(a);
  const second = toDate(b);
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

/**
 * When a test is open. Same day: "Mon, 30 Nov, 10:00 AM to 11:00 AM". Across days:
 * "Mon, 30 Nov, 10:00 AM to Tue, 1 Dec, 6:00 PM".
 */
export function formatWindow(start: DateInput, end: DateInput): string {
  const from = `${formatDayAndDate(start)}, ${formatTime(start)}`;
  return isSameDay(start, end)
    ? `${from} to ${formatTime(end)}`
    : `${from} to ${formatDayAndDate(end)}, ${formatTime(end)}`;
}

/** The three-letter month and the day number, for the calendar leaf on a test card. */
export function calendarLeaf(value: DateInput): { month: string; day: string; weekday: string } {
  const date = toDate(value);
  return {
    month: MONTHS[date.getMonth()] ?? '',
    day: String(date.getDate()),
    weekday: DAYS[date.getDay()] ?? '',
  };
}

/** "November 2026", the heading of a month in the date picker. */
export function formatMonthYear(year: number, monthIndex: number): string {
  return `${MONTHS_LONG[monthIndex] ?? ''} ${year}`;
}

/** 45 → "45 min", 60 → "1 hr", 90 → "1 hr 30 min". */
export function formatMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/** Time a student took: 725 → "12 min 5 sec", 40 → "40 sec", 3600 → "1 hr". */
export function formatTimeTaken(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hr`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (rest > 0 && hours === 0) parts.push(`${rest} sec`);
  return parts.length > 0 ? parts.join(' ') : '0 sec';
}

/** The running clock of a test: 65 000 ms → "01:05", 3 725 000 ms → "1:02:05". Never negative. */
export function formatCountdown(milliseconds: number): string {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${pad(minutes)}:${pad(rest)}`;
}

/**
 * How far away a moment is, in the largest unit that fits: "2 days", "3 hours", "12 minutes",
 * "less than a minute". The caller adds "in" or "ago".
 */
export function formatDistance(milliseconds: number): string {
  const minutes = Math.floor(Math.abs(milliseconds) / 60_000);
  if (minutes < 1) return 'less than a minute';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'}`;
}

/**
 * The weeks of a month for a calendar that starts on Sunday. Days outside the month are null,
 * so every row has seven cells.
 */
export function monthGrid(year: number, monthIndex: number): (number | null)[][] {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
