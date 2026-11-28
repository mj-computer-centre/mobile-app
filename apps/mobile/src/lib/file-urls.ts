import { BUCKETS, publicStorageUrl, storedImageUrl, type UrlBuilders } from '@mcc/shared';

import { getEnv } from './env';

/**
 * Builds the URLs the app loads files from: PDFs from the notes bucket, and pictures from
 * Cloudinary at the width asked for (or from the media bucket, for pictures from before
 * Cloudinary).
 */
export function fileUrls(): UrlBuilders {
  const { supabaseUrl } = getEnv();
  const bucketUrl = (path: string) => publicStorageUrl(supabaseUrl, BUCKETS.media, path);
  return {
    mediaUrl: (stored, width) => storedImageUrl(stored, width, bucketUrl),
    notesUrl: (path) => publicStorageUrl(supabaseUrl, BUCKETS.notes, path),
  };
}
