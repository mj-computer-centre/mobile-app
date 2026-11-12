/** Storage buckets created in supabase/migrations/20261024000700_storage.sql. */
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

export function courseImagePath(courseId: string, fileName: string): string {
  return `courses/${courseId}/${fileName}`;
}

export function bannerImagePath(fileName: string): string {
  return `banners/${fileName}`;
}

/** "1.5 MB", "820 KB" — for showing PDF sizes. */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
