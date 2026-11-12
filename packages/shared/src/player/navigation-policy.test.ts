import { describe, expect, it } from 'vitest';

import { isAllowedPlayerRequest } from './navigation-policy';

const PAGE = 'https://admin.mishracomputer.in/youtube-player.html';

describe('isAllowedPlayerRequest', () => {
  it('lets the player page load in the top frame, with any query string', () => {
    expect(isAllowedPlayerRequest({ url: PAGE, isTopFrame: true }, PAGE)).toBe(true);
    expect(isAllowedPlayerRequest({ url: `${PAGE}?v=HP8eBnwVZGg`, isTopFrame: true }, PAGE)).toBe(
      true,
    );
    expect(isAllowedPlayerRequest({ url: 'about:blank', isTopFrame: true }, PAGE)).toBe(true);
  });

  it.each([
    'https://www.youtube.com/watch?v=HP8eBnwVZGg',
    'https://m.youtube.com/@STPComputerEducation',
    'https://youtu.be/HP8eBnwVZGg',
    'https://www.google.com/aclk?sa=l&ai=ad',
    'https://admin.mishracomputer.in/other-page.html',
    'http://admin.mishracomputer.in/youtube-player.html',
  ])('blocks the top frame from leaving the player: %s', (url) => {
    expect(isAllowedPlayerRequest({ url, isTopFrame: true }, PAGE)).toBe(false);
  });

  it('treats a request with no frame information as a top-frame request', () => {
    expect(isAllowedPlayerRequest({ url: 'https://www.youtube.com/watch?v=x' }, PAGE)).toBe(false);
  });

  it('lets the YouTube embed and its ads load inside the player', () => {
    expect(
      isAllowedPlayerRequest(
        { url: 'https://www.youtube.com/embed/HP8eBnwVZGg?rel=0', isTopFrame: false },
        PAGE,
      ),
    ).toBe(true);
    expect(
      isAllowedPlayerRequest(
        { url: 'https://googleads.g.doubleclick.net/pagead/id', isTopFrame: false },
        PAGE,
      ),
    ).toBe(true);
  });

  it('stops the embed from turning into the YouTube website', () => {
    expect(
      isAllowedPlayerRequest(
        { url: 'https://www.youtube.com/watch?v=HP8eBnwVZGg', isTopFrame: false },
        PAGE,
      ),
    ).toBe(false);
  });

  it.each([
    'intent://www.youtube.com/watch?v=HP8eBnwVZGg#Intent;scheme=https;package=com.google.android.youtube;end',
    'vnd.youtube:HP8eBnwVZGg',
    'market://details?id=com.google.android.youtube',
    'javascript:alert(1)',
  ])('never opens another app: %s', (url) => {
    expect(isAllowedPlayerRequest({ url, isTopFrame: true }, PAGE)).toBe(false);
    expect(isAllowedPlayerRequest({ url, isTopFrame: false }, PAGE)).toBe(false);
  });
});
