import { BUCKETS, publicStorageUrl, type UrlBuilders } from '@mcc/shared';

import { getEnv } from './env';

/** Builds public URLs for files in the media and notes buckets. */
export function fileUrls(): UrlBuilders {
  const { supabaseUrl } = getEnv();
  return {
    mediaUrl: (path) => publicStorageUrl(supabaseUrl, BUCKETS.media, path),
    notesUrl: (path) => publicStorageUrl(supabaseUrl, BUCKETS.notes, path),
  };
}
