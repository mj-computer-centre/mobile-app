import { describe, expect, it } from 'vitest';

import { parseYouTubeUrl } from './parse-url';

const VIDEO = 'HP8eBnwVZGg';
const PLAYLIST = 'PLwmDa-QvqlfjX578JpaNc0i0UD3FCiGUA';

describe('parseYouTubeUrl', () => {
  it.each([
    `https://www.youtube.com/watch?v=${VIDEO}`,
    `https://youtube.com/watch?feature=share&v=${VIDEO}&t=42s`,
    `https://m.youtube.com/watch?v=${VIDEO}`,
    `youtube.com/watch?v=${VIDEO}`,
    `https://youtu.be/${VIDEO}`,
    `https://youtu.be/${VIDEO}?si=mNe6y-8TKFS75EuI`,
    `https://www.youtube.com/shorts/${VIDEO}`,
    `https://www.youtube.com/live/${VIDEO}?feature=share`,
    `https://www.youtube.com/embed/${VIDEO}`,
    `https://www.youtube-nocookie.com/embed/${VIDEO}`,
    `  ${VIDEO}  `,
  ])('reads a video link: %s', (input) => {
    expect(parseYouTubeUrl(input)).toEqual({ kind: 'video', videoId: VIDEO });
  });

  it('reads a playlist page', () => {
    expect(parseYouTubeUrl(`https://www.youtube.com/playlist?list=${PLAYLIST}`)).toEqual({
      kind: 'playlist',
      playlistId: PLAYLIST,
      videoId: null,
    });
  });

  it('treats a video opened from a playlist as the playlist, remembering the video', () => {
    expect(
      parseYouTubeUrl(`https://www.youtube.com/watch?v=${VIDEO}&list=${PLAYLIST}&index=2`),
    ).toEqual({
      kind: 'playlist',
      playlistId: PLAYLIST,
      videoId: VIDEO,
    });
  });

  it('ignores auto-generated mixes, which cannot be imported', () => {
    expect(parseYouTubeUrl(`https://www.youtube.com/watch?v=${VIDEO}&list=RD${VIDEO}`)).toEqual({
      kind: 'video',
      videoId: VIDEO,
    });
  });

  it.each([
    '',
    'hello',
    'https://www.youtube.com/@STPComputerEducation',
    'https://www.youtube.com/watch?v=short',
    'https://vimeo.com/123456',
    'https://notyoutube.com/watch?v=HP8eBnwVZGg',
    'https://www.stpcomputereducation.com/notes',
  ])('rejects what is not a YouTube video or playlist: %s', (input) => {
    expect(parseYouTubeUrl(input)).toBeNull();
  });
});
