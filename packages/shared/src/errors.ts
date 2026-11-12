/**
 * Stable error codes. Database functions raise `mcc:<code>` (see private.fail in the foundation
 * migration); edge functions return `{ error: { code } }`. The app shows `errorMessage(code)`.
 */
export const ERROR_CODES = [
  'staff_only',
  'owner_only',
  'last_owner',
  'user_not_found',
  'course_not_found',
  'section_not_found',
  'lesson_not_found',
  'order_mismatch',
  'notes_must_be_pdf',
  'duplicate_video',
  'file_too_large',
  'invalid_youtube_link',
  'youtube_not_found',
  'youtube_unavailable',
  'not_signed_in',
  'network',
  'demo_mode',
  'unknown',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

const MESSAGES: Record<ErrorCode, string> = {
  staff_only: 'Only the centre’s staff can do this.',
  owner_only: 'Only the owner can do this.',
  last_owner: 'The centre needs at least one owner. Add another owner first.',
  user_not_found:
    'No account with this email. Ask them to sign in to the app once, then try again.',
  course_not_found: 'This course no longer exists.',
  section_not_found: 'This unit no longer exists.',
  lesson_not_found: 'This lesson no longer exists.',
  order_mismatch: 'Someone else changed this list. Refresh and try again.',
  notes_must_be_pdf: 'Notes attached to a video must be a PDF.',
  duplicate_video: 'This video is already in the library.',
  file_too_large: 'This file is too big. PDFs can be up to 50 MB and pictures up to 5 MB.',
  invalid_youtube_link: 'This is not a YouTube video or playlist link.',
  youtube_not_found:
    'YouTube could not find this video or playlist. Check that it is Public or Unlisted.',
  youtube_unavailable: 'YouTube did not respond. Try again in a minute.',
  not_signed_in: 'Please sign in again.',
  network: 'No internet connection. Check your connection and try again.',
  demo_mode:
    'Dev bypass is on, so nothing is saved. Remove EXPO_PUBLIC_DEV_AUTH_BYPASS and sign in to use a real project.',
  unknown: 'Something went wrong. Please try again.',
};

export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, options?: { cause?: unknown }) {
    super(MESSAGES[code], options);
    this.name = 'AppError';
    this.code = code;
  }
}

export function errorMessage(code: ErrorCode): string {
  return MESSAGES[code];
}

function isErrorCode(value: string): value is ErrorCode {
  return (ERROR_CODES as readonly string[]).includes(value);
}

/** Turns anything thrown by Supabase, fetch or our own code into an AppError. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : '';
  const match = /mcc:([a-z_]+)/.exec(message);
  if (match?.[1] && isErrorCode(match[1])) return new AppError(match[1], { cause: error });
  if (/network request failed|failed to fetch|networkerror/i.test(message)) {
    return new AppError('network', { cause: error });
  }
  if (/jwt|not authenticated|auth session missing/i.test(message)) {
    return new AppError('not_signed_in', { cause: error });
  }
  return new AppError('unknown', { cause: error });
}
