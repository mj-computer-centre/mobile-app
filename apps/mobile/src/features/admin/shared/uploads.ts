import { AppError, toAppError, type Bucket } from '@mcc/shared';

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
