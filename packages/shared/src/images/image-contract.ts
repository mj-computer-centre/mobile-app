import { z } from 'zod';

/**
 * Contracts of the `upload-image` and `remove-images` edge functions, which keep the centre's
 * pictures (course covers and home banners) on Cloudinary. The app validates every response
 * against these schemas.
 */

/** What a picture is for. Each kind has its own folder; keep in sync with IMAGE_FOLDERS there. */
export const IMAGE_KINDS = ['course', 'banner'] as const;

export type ImageKind = (typeof IMAGE_KINDS)[number];

const CLOUDINARY_IMAGE = /^https:\/\/res\.cloudinary\.com\/[A-Za-z0-9_-]+\/image\/upload\//;

/**
 * True for a picture kept on Cloudinary. `courses.thumbnail_path` and `banners.image_path` hold
 * either such a URL or, for pictures uploaded before Cloudinary, a path in the `media` bucket.
 * Nothing else is ever treated as a URL, so a stray link in those columns cannot make the app
 * load a picture from somewhere unknown.
 */
export function isCloudinaryImage(stored: string): boolean {
  return CLOUDINARY_IMAGE.test(stored);
}

/** `upload-image` answers with where the picture now lives. Short enough for the columns. */
export const uploadImageResponseSchema = z.object({
  url: z.string().max(300).regex(CLOUDINARY_IMAGE),
});

export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;

/** How many pictures one call to `remove-images` may name; the function has the same number. */
export const MAX_IMAGES_PER_REMOVAL = 10;

export const removeImagesRequestSchema = z.object({
  urls: z.array(z.string().max(300)).min(1).max(MAX_IMAGES_PER_REMOVAL),
});

export type RemoveImagesRequest = z.infer<typeof removeImagesRequestSchema>;

/** Pictures that were not this app's, or are still shown somewhere, are skipped, not counted. */
export const removeImagesResponseSchema = z.object({
  removed: z.number().int().min(0),
});

export type RemoveImagesResponse = z.infer<typeof removeImagesResponseSchema>;
