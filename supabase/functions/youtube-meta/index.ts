// POST { url } → title, thumbnail, duration and playability for a YouTube video or every video
// in a playlist. Staff only. Response shape: youtubeMetaResponseSchema in packages/shared.
import { requireStaff } from '../_shared/auth.ts';
import { errorResponse, json, preflight } from '../_shared/http.ts';
import { fetchPlaylist, fetchVideos } from '../_shared/youtube-api.ts';
import { parseYouTubeUrl } from '../_shared/youtube-parsing.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'POST') return errorResponse('unknown', 405);

  const caller = await requireStaff(req);
  if (caller instanceof Response) return caller;

  const body = await req.json().catch(() => null);
  const link = parseYouTubeUrl(typeof body?.url === 'string' ? body.url : '');
  if (!link) return errorResponse('invalid_youtube_link', 400);

  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  if (!apiKey) {
    console.error('youtube-meta: YOUTUBE_API_KEY is not set');
    return errorResponse('youtube_unavailable', 503);
  }

  try {
    if (link.kind === 'video') {
      const items = await fetchVideos([link.videoId], apiKey);
      if (items.length === 0) return errorResponse('youtube_not_found', 404);
      return json({ kind: 'video', playlistTitle: null, items, truncated: false });
    }

    const playlist = await fetchPlaylist(link.playlistId, apiKey);
    if (!playlist) return errorResponse('youtube_not_found', 404);
    return json({
      kind: 'playlist',
      playlistTitle: playlist.title,
      items: playlist.items,
      truncated: playlist.truncated,
    });
  } catch (error) {
    console.error(
      'youtube-meta: YouTube request failed',
      error instanceof Error ? error.message : error,
    );
    return errorResponse('youtube_unavailable', 502);
  }
});
