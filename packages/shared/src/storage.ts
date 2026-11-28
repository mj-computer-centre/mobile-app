/**
 * Storage buckets created in supabase/migrations/20261024000700_storage.sql. `notes` holds the
 * PDFs. `media` held course pictures and banners before they moved to Cloudinary (see
 * images/image-url.ts); it is still read for the pictures uploaded back then.
 */
export const BUCKETS = {
  notes: 'notes',
  media: 'media',
} as const;

export type Bucket = (typeof BUCKETS)[keyof typeof BUCKETS];

export const LIMITS = {
  pdfBytes: 50 * 1024 * 1024,
  imageBytes: 5 * 1024 * 1024,
} as const;

/** Public URL of a file in a public bucket. Each path segment is encoded; slashes are kept. */
export function publicStorageUrl(supabaseUrl: string, bucket: Bucket, path: string): string {
  const base = supabaseUrl.replace(/\/+$/, '');
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}

export function notesPath(lessonId: string): string {
  return `${lessonId}.pdf`;
}

/** "1.5 MB", "820 KB" — for showing PDF sizes. */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
