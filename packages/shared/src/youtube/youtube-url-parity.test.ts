import { describe, expect, it } from 'vitest';

import * as edge from '../../../../supabase/functions/_shared/youtube-parsing';
import { parseIsoDuration } from './duration';
import { parseYouTubeUrl } from './parse-url';

// The edge function carries its own copy of the parsers. These inputs cover every branch; if a
// change is made to one copy only, this test fails.
const LINKS = [
  'HP8eBnwVZGg',
  'https://www.youtube.com/watch?v=HP8eBnwVZGg',
  'youtube.com/watch?feature=share&v=HP8eBnwVZGg&t=42s',
  'https://m.youtube.com/watch?v=HP8eBnwVZGg',
  'https://music.youtube.com/watch?v=HP8eBnwVZGg',
  'https://youtu.be/HP8eBnwVZGg?si=abc',
  'https://www.youtube.com/shorts/HP8eBnwVZGg',
  'https://www.youtube.com/live/HP8eBnwVZGg',
  'https://www.youtube-nocookie.com/embed/HP8eBnwVZGg',
  'https://www.youtube.com/playlist?list=PLwmDa-QvqlfjX578JpaNc0i0UD3FCiGUA',
  'https://www.youtube.com/watch?v=HP8eBnwVZGg&list=PLwmDa-QvqlfjX578JpaNc0i0UD3FCiGUA',
  'https://www.youtube.com/watch?v=HP8eBnwVZGg&list=RDHP8eBnwVZGg',
  'https://www.youtube.com/watch?v=HP8eBnwVZGg&x=%E0%A4',
  'https://www.youtube.com/@STPComputerEducation',
  'https://youtube.com:443/watch?v=HP8eBnwVZGg',
  'https://vimeo.com/123',
  '',
];

const DURATIONS = ['PT4M56S', 'PT1H2M3S', 'P1DT2H', 'PT', 'P', 'nonsense'];

describe('edge function parser copy', () => {
  it.each(LINKS)('parses %s the same way', (link) => {
    expect(edge.parseYouTubeUrl(link)).toEqual(parseYouTubeUrl(link));
  });

  it.each(DURATIONS)('reads duration %s the same way', (value) => {
    expect(edge.parseIsoDuration(value)).toBe(parseIsoDuration(value));
  });
});
