// Copy of packages/shared/src/youtube/parse-url.ts and the duration parser, for the edge runtime,
// which cannot import workspace packages. packages/shared/src/youtube/youtube-url-parity.test.ts
// runs both copies against the same inputs; keep them identical in behaviour.
// No Deno APIs in this file, so the parity test can import it under Node.

export type YouTubeLink =
  | { kind: 'video'; videoId: string }
  | { kind: 'playlist'; playlistId: string; videoId: string | null };

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const PLAYLIST_ID = /^[A-Za-z0-9_-]{12,64}$/;
const VIDEO_PATH_PREFIXES = new Set(['embed', 'shorts', 'live', 'v', 'e']);

function splitUrl(raw: string) {
  const match = /^(?:https?:\/\/)?([^/?#\s]+)([^?#\s]*)(?:\?([^#\s]*))?/i.exec(raw);
  if (!match?.[1]) return null;
  const host = match[1]
    .toLowerCase()
    .replace(/:\d+$/, '')
    .replace(/^(www\.|m\.|music\.)/, '');
  const segments = (match[2] ?? '').split('/').filter(Boolean);
  const query = new Map<string, string>();
  for (const pair of (match[3] ?? '').split('&')) {
    const [key, value = ''] = pair.split('=');
    if (!key) continue;
    try {
      query.set(decodeURIComponent(key), decodeURIComponent(value.replace(/\+/g, ' ')));
    } catch {
      // ignore a malformed escape in an unrelated parameter
    }
  }
  return { host, segments, query };
}

export function parseYouTubeUrl(input: string): YouTubeLink | null {
  const raw = input.trim();
  if (VIDEO_ID.test(raw)) return { kind: 'video', videoId: raw };

  const url = splitUrl(raw);
  if (!url) return null;

  let videoId: string | null = null;
  const [first, second] = url.segments;
  if (url.host === 'youtu.be') {
    videoId = first ?? null;
  } else if (url.host === 'youtube.com' || url.host === 'youtube-nocookie.com') {
    if (first === 'watch') videoId = url.query.get('v') ?? null;
    else if (first && VIDEO_PATH_PREFIXES.has(first)) videoId = second ?? null;
  } else {
    return null;
  }

  const validVideoId = videoId && VIDEO_ID.test(videoId) ? videoId : null;
  const list = url.query.get('list');
  if (list && PLAYLIST_ID.test(list) && !list.startsWith('RD')) {
    return { kind: 'playlist', playlistId: list, videoId: validVideoId };
  }
  return validVideoId ? { kind: 'video', videoId: validVideoId } : null;
}

export function parseIsoDuration(value: string): number | null {
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(value);
  if (!match || value === 'P' || value === 'PT') return null;
  const [, days = '0', hours = '0', minutes = '0', seconds = '0'] = match;
  return Number(days) * 86400 + Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}
