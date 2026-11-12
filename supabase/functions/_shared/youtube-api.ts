// Minimal YouTube Data API v3 client: video details and playlist contents.
// Quota: videos.list, playlists.list and playlistItems.list cost 1 unit per call; a 200-video
// playlist costs about 9 units of the free 10,000 a day.
import { parseIsoDuration } from './youtube-parsing.ts';

const API = 'https://www.googleapis.com/youtube/v3';
const TIMEOUT_MS = 10_000;
export const MAX_PLAYLIST_ITEMS = 200; // keep in sync with packages/shared meta-contract.ts

export interface VideoMeta {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number | null;
  embeddable: boolean;
  privacyStatus: string;
}

interface Thumbnail {
  url?: string;
}

interface VideoResource {
  id: string;
  snippet?: { title?: string; thumbnails?: Record<string, Thumbnail | undefined> };
  contentDetails?: { duration?: string };
  status?: { embeddable?: boolean; privacyStatus?: string };
}

async function call<T>(
  path: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<T | null> {
  const query = new URLSearchParams({ ...params, key: apiKey });
  const response = await fetch(`${API}/${path}?${query}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`YouTube API ${path} answered ${response.status}`);
  return (await response.json()) as T;
}

function toVideoMeta(video: VideoResource): VideoMeta {
  const thumbs = video.snippet?.thumbnails ?? {};
  return {
    videoId: video.id,
    title: video.snippet?.title?.slice(0, 200) || 'Untitled video',
    thumbnailUrl:
      thumbs.high?.url ??
      thumbs.medium?.url ??
      thumbs.default?.url ??
      `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
    durationSeconds: video.contentDetails?.duration
      ? parseIsoDuration(video.contentDetails.duration)
      : null,
    embeddable: video.status?.embeddable ?? false,
    privacyStatus: video.status?.privacyStatus ?? 'unknown',
  };
}

/** Details for up to any number of ids, in the order given. Missing (deleted) videos are skipped. */
export async function fetchVideos(ids: string[], apiKey: string): Promise<VideoMeta[]> {
  const byId = new Map<string, VideoMeta>();
  for (let start = 0; start < ids.length; start += 50) {
    const batch = ids.slice(start, start + 50);
    const page = await call<{ items?: VideoResource[] }>(
      'videos',
      { part: 'snippet,contentDetails,status', id: batch.join(','), maxResults: '50' },
      apiKey,
    );
    for (const video of page?.items ?? []) byId.set(video.id, toVideoMeta(video));
  }
  return ids.map((id) => byId.get(id)).filter((video): video is VideoMeta => video !== undefined);
}

export interface PlaylistMeta {
  title: string;
  items: VideoMeta[];
  truncated: boolean;
}

/** The playlist's title and videos in playlist order, or null if YouTube cannot find it. */
export async function fetchPlaylist(
  playlistId: string,
  apiKey: string,
): Promise<PlaylistMeta | null> {
  const info = await call<{ items?: { snippet?: { title?: string } }[] }>(
    'playlists',
    { part: 'snippet', id: playlistId },
    apiKey,
  );
  const title = info?.items?.[0]?.snippet?.title;
  if (!title) return null;

  const videoIds: string[] = [];
  let pageToken: string | undefined;
  let truncated = false;
  do {
    const page = await call<{
      items?: { contentDetails?: { videoId?: string } }[];
      nextPageToken?: string;
    }>(
      'playlistItems',
      {
        part: 'contentDetails',
        playlistId,
        maxResults: '50',
        ...(pageToken ? { pageToken } : {}),
      },
      apiKey,
    );
    for (const item of page?.items ?? []) {
      const id = item.contentDetails?.videoId;
      if (id && !videoIds.includes(id)) videoIds.push(id);
    }
    pageToken = page?.nextPageToken;
    if (videoIds.length >= MAX_PLAYLIST_ITEMS) {
      truncated = Boolean(pageToken) || videoIds.length > MAX_PLAYLIST_ITEMS;
      break;
    }
  } while (pageToken);

  const items = await fetchVideos(videoIds.slice(0, MAX_PLAYLIST_ITEMS), apiKey);
  return { title, items, truncated };
}
