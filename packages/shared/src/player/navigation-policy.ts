/**
 * Decides which page loads the in-app YouTube player may make. This is how the app keeps its
 * promise that no tap ever leaves the app: the player's WebView asks this policy before every
 * navigation, and anything not explicitly allowed is cancelled.
 *
 * - The top frame may only show our own player page (the iframe host) or a blank page.
 * - Inner frames (the YouTube embed and the ads YouTube puts inside it) may load over https,
 *   except YouTube's own site pages, which would turn the player into the YouTube website.
 * - Other schemes (intent:, vnd.youtube:, market:) open other apps and are always refused.
 *
 * When a platform does not say whether a request is for the top frame, it is treated as one.
 */
export interface PlayerNavigationRequest {
  url: string;
  isTopFrame?: boolean | undefined;
}

const BLANK_PAGES = new Set(['about:blank', 'about:srcdoc']);
const YOUTUBE_SITE_HOSTS = /^(www\.|m\.)?youtube\.com$/i;

function originAndPath(url: string): { scheme: string; host: string; path: string } | null {
  const match = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]+)([^?#]*)/i.exec(url);
  if (!match?.[1] || !match[2]) return null;
  return {
    scheme: match[1].toLowerCase(),
    host: match[2].toLowerCase(),
    path: match[3] || '/',
  };
}

export function isAllowedPlayerRequest(
  request: PlayerNavigationRequest,
  playerPageUrl: string,
): boolean {
  if (BLANK_PAGES.has(request.url)) return true;

  const target = originAndPath(request.url);
  if (!target || target.scheme !== 'https') return false;

  if (request.isTopFrame !== false) {
    const page = originAndPath(playerPageUrl);
    return page !== null && target.host === page.host && target.path === page.path;
  }

  if (YOUTUBE_SITE_HOSTS.test(target.host) && !target.path.startsWith('/embed/')) {
    return false;
  }
  return true;
}
