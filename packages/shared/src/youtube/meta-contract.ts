import { z } from 'zod';

/**
 * Contract of the `youtube-meta` edge function (supabase/functions/youtube-meta). The app
 * validates every response against this schema, so a change on one side fails loudly instead of
 * saving half-filled lessons.
 */
export const youtubeMetaRequestSchema = z.object({
  url: z.string().min(1),
});

export type YoutubeMetaRequest = z.infer<typeof youtubeMetaRequestSchema>;

export const youtubeVideoMetaSchema = z.object({
  videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  title: z.string(),
  thumbnailUrl: z.string(),
  durationSeconds: z.number().int().nonnegative().nullable(),
  /** False when the owner switched off "Allow embedding": such videos cannot play in the app. */
  embeddable: z.boolean(),
  privacyStatus: z.string(),
});

export type YoutubeVideoMeta = z.infer<typeof youtubeVideoMetaSchema>;

export const youtubeMetaResponseSchema = z.object({
  kind: z.enum(['video', 'playlist']),
  playlistTitle: z.string().nullable(),
  items: z.array(youtubeVideoMetaSchema),
  /** True when a playlist had more videos than one import takes (see MAX_PLAYLIST_ITEMS). */
  truncated: z.boolean(),
});

export type YoutubeMetaResponse = z.infer<typeof youtubeMetaResponseSchema>;

export const MAX_PLAYLIST_ITEMS = 200;

/** Videos that will not play in the app and why, for warnings in the admin panel. */
export function playbackProblem(video: YoutubeVideoMeta): string | null {
  if (video.privacyStatus === 'private')
    return 'This video is Private on YouTube. Make it Public or Unlisted.';
  if (!video.embeddable)
    return 'Embedding is switched off for this video on YouTube, so it cannot play in the app.';
  return null;
}
