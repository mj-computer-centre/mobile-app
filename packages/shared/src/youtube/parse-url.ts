/**
 * Understands the YouTube links people actually paste: watch, youtu.be, shorts, live, embed,
 * playlist pages and watch-with-list links, with or without https:// and tracking parameters.
 *
 * Parsed by hand rather than with `URL`, because React Native's URL implementation does not
 * support searchParams. supabase/functions/_shared/youtube-url.ts carries a copy for the edge
 * function; youtube-url-parity.test.ts keeps the two identical in behaviour.
 */
export type YouTubeLink =
  | { kind: 'video'; videoId: string }
  | { kind: 'playlist'; playlistId: string; videoId: string | null };

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
// PL…, UU…, OLAK5uy_… and similar. RD… are auto-generated mixes the API cannot list.
const PLAYLIST_ID = /^[A-Za-z0-9_-]{12,64}$/;
const VIDEO_PATH_PREFIXES = new Set(['embed', 'shorts', 'live', 'v', 'e']);

interface SplitUrl {
  host: string;
  segments: string[];
  query: Map<string, string>;
}

function splitUrl(raw: string): SplitUrl | null {
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
      // A malformed escape in an unrelated parameter should not reject the whole link.
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
