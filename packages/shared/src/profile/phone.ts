/**
 * Indian mobile numbers are stored as 10 digits starting with 6–9 (the database enforces it).
 * People type them with spaces, dashes, +91, 91 or a leading 0; all of those are accepted.
 */
export function normalizeIndianMobile(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/** "9876543210" → "98765 43210", the way people say it. */
export function formatIndianMobile(digits: string): string {
  return /^\d{10}$/.test(digits) ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}
