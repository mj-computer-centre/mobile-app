import { z } from 'zod';

/**
 * Contract of the `course-image` edge function (supabase/functions/course-image), which draws
 * one AI picture for a course's cover. The app validates every response against this schema.
 */

/** How many takes one press of "Make pictures" asks for. Keep in sync with COVER_VIEWS there. */
export const COVER_TAKES = 4;

/** Asked of the admin before drawing: the model needs to know what the course is. */
export const MIN_COVER_TITLE_LENGTH = 2;

export const courseImageRequestSchema = z.object({
  title: z.string().trim().min(MIN_COVER_TITLE_LENGTH, 'Type the course name first').max(120),
  description: z.string().trim().max(500).default(''),
  /** Extra words from the admin for what the picture should show. */
  details: z.string().trim().max(200, 'Keep this under 200 characters').default(''),
  /** Which of the takes (style and what is in view) to draw. */
  view: z
    .number()
    .int()
    .min(0)
    .max(COVER_TAKES - 1)
    .default(0),
});

export type CourseImageRequest = z.input<typeof courseImageRequestSchema>;

export const courseImageResponseSchema = z.object({
  /** The picture as a data URL (`data:image/jpeg;base64,…`). */
  image: z.string().regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/),
});

export type CourseImageResponse = z.infer<typeof courseImageResponseSchema>;

export interface DecodedImage {
  mimeType: string;
  /** "jpg", "png" or "webp", for the file name. */
  extension: string;
  bytes: Uint8Array<ArrayBuffer>;
}

/** The bytes of a picture given as a data URL, or null when it is not one. */
export function decodeImageDataUrl(dataUrl: string): DecodedImage | null {
  const match = /^data:(image\/(jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match?.[1] || !match[2] || !match[3]) return null;
  let binary: string;
  try {
    binary = atob(match[3]);
  } catch {
    return null;
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return { mimeType: match[1], extension: match[2] === 'jpeg' ? 'jpg' : match[2], bytes };
}
