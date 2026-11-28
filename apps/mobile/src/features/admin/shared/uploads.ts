import {
  AppError,
  BUCKETS,
  isCloudinaryImage,
  LIMITS,
  removeImagesResponseSchema,
  toAppError,
  uploadImageResponseSchema,
  type Bucket,
  type ImageKind,
} from '@mcc/shared';

import { invokeFunction } from '@/lib/data';
import { readPickedFile, type PickedFile } from '@/lib/platform/picked-file';
import { supabase } from '@/lib/supabase';

/** Uploads a picked file to a bucket. Never overwrites: every upload gets a new path. */
export async function uploadFile(
  bucket: Bucket,
  path: string,
  file: PickedFile,
  maxBytes: number,
): Promise<void> {
  if (file.sizeBytes !== null && file.sizeBytes > maxBytes) {
    throw new AppError('file_too_large');
  }
  const body = await readPickedFile(file);
  const { error } = await supabase().storage.from(bucket).upload(path, body, {
    contentType: file.mimeType,
    upsert: false,
    cacheControl: '31536000',
  });
  if (error) throw toAppError(error);
}

/** Best-effort removal of files that are no longer referenced. */
export async function removeFiles(bucket: Bucket, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  await supabase().storage.from(bucket).remove(paths);
}

/**
 * Stores a course cover or a home banner on Cloudinary and returns the URL to save on the
 * course or banner. It goes through the `upload-image` function, which holds the Cloudinary
 * keys: the app has none.
 */
export async function storeImage(kind: ImageKind, file: PickedFile): Promise<string> {
  if (file.sizeBytes !== null && file.sizeBytes > LIMITS.imageBytes) {
    throw new AppError('file_too_large');
  }
  const body = await readPickedFile(file);
  const { url } = await invokeFunction(
    `upload-image?kind=${kind}`,
    body,
    uploadImageResponseSchema,
    'images_not_set_up',
  );
  return url;
}

/**
 * Best-effort removal of pictures nothing shows any more. `stored` is what the rows held:
 * Cloudinary URLs go to the `remove-images` function, and paths from before Cloudinary are
 * removed from the media bucket. A failure here never fails the change that came before it.
 */
export async function removeImages(stored: (string | null | undefined)[]): Promise<void> {
  const all = stored.filter((value): value is string => Boolean(value));
  const urls = all.filter(isCloudinaryImage);
  const paths = all.filter((value) => !isCloudinaryImage(value));
  await Promise.allSettled([
    urls.length > 0 ? invokeFunction('remove-images', { urls }, removeImagesResponseSchema) : null,
    removeFiles(BUCKETS.media, paths),
  ]);
}
