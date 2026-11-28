import { describe, expect, it } from 'vitest';

import {
  COVER_VIEW_COUNT,
  COVER_VIEWS,
  coverContent,
  coverPrompt,
} from '../../../../supabase/functions/_shared/cover-prompt';
import { sniffImageType } from '../../../../supabase/functions/_shared/image-type';
import {
  COVER_TAKES,
  courseImageRequestSchema,
  courseImageResponseSchema,
  decodeImageDataUrl,
} from './course-image-contract';

// The prompt lives with the edge function that sends it; it is plain TypeScript, so it is
// tested here with the contract the app and the function share.

describe('cover prompt', () => {
  const subject = {
    title: ' DCA ',
    description: 'Diploma in Computer Applications.',
    details: '',
  };
  const tally = { title: 'Tally Prime', description: 'Accounting and GST billing', details: '' };

  it('never sends the course’s own words: the model would paint them across the picture', () => {
    for (const view of COVER_VIEWS.keys()) {
      expect(coverPrompt(tally, view)).not.toMatch(/tally|prime|accounting|gst|billing/i);
      expect(coverPrompt(subject, view)).not.toMatch(/dca|diploma|applications/i);
    }
    // Nor the words that invite a title.
    expect(coverPrompt(subject, 0)).not.toMatch(/\b(cover|course|poster)\b/i);
  });

  it('chooses things to draw by the kind of course', () => {
    expect(coverContent('Tally Prime', 'Accounting and GST billing').things[0]).toContain(
      'calculator',
    );
    expect(coverContent('DCA', 'Diploma in Computer Applications').things[0]).toContain(
      'graduation cap',
    );
    expect(coverContent('ADCA', '').things[0]).toContain('graduation cap');
    expect(coverContent('Computer Hardware', 'Repair and assembly').things[0]).toContain(
      'circuit board',
    );
    expect(coverContent('Photoshop', '').things[0]).toContain('drawing tablet');
    expect(coverContent('Spoken English', '').things[0]).toContain('headset');
    expect(coverPrompt(tally, 0)).toContain('Beside the computer: a calculator, an open ledger');
  });

  it('shows the subject on the screen when the subject is what is on the screen', () => {
    expect(coverContent('MS Excel', '').screen).toContain('grid of coloured cells');
    expect(coverContent('Python', 'Programming for beginners').screen).toContain('lines of');
    expect(coverPrompt({ ...tally, title: 'MS Excel', description: '' }, 0)).toContain(
      'The computer screen shows a grid of coloured cells beside a simple bar chart, drawn as plain shapes. ',
    );
    expect(coverPrompt(tally, 0)).toContain('The computer screen is blank. ');
  });

  it('draws a plain computer scene for a course it does not know', () => {
    expect(coverContent('Basic Computer', 'For beginners')).toEqual({ things: [], screen: null });
    expect(coverPrompt({ title: 'Basic Computer', description: '', details: '' }, 0)).not.toContain(
      'Beside the computer',
    );
  });

  it('reads whole words where part of a word would mislead', () => {
    // "English typing" is a typing course, not spoken English.
    const typing = coverContent('English Typing', 'Learn to type fast');
    expect(typing.things).toHaveLength(1);
    expect(typing.things[0]).toContain('sand timer');
    // "Designed for beginners" does not make it a design course.
    expect(coverContent('Basic Computer', 'Designed for beginners').things).toEqual([]);
    expect(coverContent('Web Design', 'HTML and CSS').things[0]).toContain('colour swatches');
  });

  it('lets at most two subjects shape one picture', () => {
    const everything = coverContent(
      'Tally, Excel, typing, Photoshop, hardware, internet and spoken English diploma',
      '',
    );
    expect(everything.things.length + (everything.screen ? 1 : 0)).toBe(2);
  });

  it('starts with the take', () => {
    expect(coverPrompt(subject, 0).startsWith(`${COVER_VIEWS[0]}. `)).toBe(true);
  });

  it('asks for the app’s colours, room to crop, and no words in the picture', () => {
    const prompt = coverPrompt(subject, 1);
    expect(prompt).toContain('deep indigo blue, marigold yellow and white');
    expect(prompt).toContain('empty space above and below');
    expect(prompt).toContain('Every sign, wall and sheet of paper is blank');
    expect(prompt).toMatch(/no words, no letters, no numbers, no logos and no watermark\.$/);
  });

  it('adds what the admin asked to see', () => {
    expect(coverPrompt({ ...subject, details: 'a ledger book and a calculator.' }, 0)).toContain(
      'It shows a ledger book and a calculator. ',
    );
    expect(coverPrompt(subject, 0)).not.toContain('It shows');
  });

  it('draws a different take for each view, and the first for a view that does not exist', () => {
    const prompts = COVER_VIEWS.map((_, view) => coverPrompt(subject, view));
    expect(new Set(prompts).size).toBe(COVER_VIEW_COUNT);
    expect(coverPrompt(subject, 99)).toBe(prompts[0]);
  });

  it('shows hands at most, never a whole person', () => {
    for (const view of COVER_VIEWS) {
      expect(/\b(student|teacher|person|people|man|woman)\b/i.test(view)).toBe(false);
    }
  });
});

describe('the contract shared with the edge function', () => {
  it('asks for as many takes as the function can draw', () => {
    expect(COVER_TAKES).toBe(COVER_VIEW_COUNT);
  });

  it('needs a course name before drawing', () => {
    expect(courseImageRequestSchema.safeParse({ title: ' ', view: 0 }).success).toBe(false);
    expect(courseImageRequestSchema.safeParse({ title: 'DCA', view: 0 }).success).toBe(true);
  });

  it('fills in what is left out and refuses a take that does not exist', () => {
    expect(courseImageRequestSchema.parse({ title: ' DCA ' })).toEqual({
      title: 'DCA',
      description: '',
      details: '',
      view: 0,
    });
    expect(courseImageRequestSchema.safeParse({ title: 'DCA', view: COVER_TAKES }).success).toBe(
      false,
    );
  });

  it('accepts a picture as a data URL and nothing else', () => {
    expect(
      courseImageResponseSchema.safeParse({ image: 'data:image/jpeg;base64,/9j/4AAQ' }).success,
    ).toBe(true);
    expect(
      courseImageResponseSchema.safeParse({ image: 'https://example.com/a.jpg' }).success,
    ).toBe(false);
    expect(
      courseImageResponseSchema.safeParse({ image: 'data:text/html;base64,PGI+' }).success,
    ).toBe(false);
  });
});

describe('decoding a picture', () => {
  // The first bytes of a JPEG, a PNG and a WebP file.
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const webp = Uint8Array.from(
    [...'RIFF', 0, 0, 0, 0, ...'WEBP'].map((value) =>
      typeof value === 'string' ? value.charCodeAt(0) : value,
    ),
  );
  const base64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));

  it('tells the three kinds apart by their first bytes', () => {
    expect(sniffImageType(jpeg)).toBe('jpeg');
    expect(sniffImageType(png)).toBe('png');
    expect(sniffImageType(webp)).toBe('webp');
    expect(sniffImageType(Uint8Array.from([0x3c, 0x68, 0x74, 0x6d, 0x6c]))).toBeNull();
    expect(sniffImageType(new Uint8Array())).toBeNull();
  });

  it('turns a data URL back into the same bytes', () => {
    const decoded = decodeImageDataUrl(`data:image/jpeg;base64,${base64(jpeg)}`);
    expect(decoded?.mimeType).toBe('image/jpeg');
    expect(decoded?.extension).toBe('jpg');
    expect([...(decoded?.bytes ?? [])]).toEqual([...jpeg]);
    expect(decodeImageDataUrl(`data:image/png;base64,${base64(png)}`)?.extension).toBe('png');
  });

  it('gives null for anything that is not a picture', () => {
    expect(decodeImageDataUrl('data:text/plain;base64,aGk=')).toBeNull();
    expect(decodeImageDataUrl('not a data url')).toBeNull();
    expect(decodeImageDataUrl('data:image/jpeg;base64,***')).toBeNull();
  });
});
