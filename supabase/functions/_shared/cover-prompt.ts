// The words sent to the image model for a course's cover picture. Plain TypeScript with no
// imports, so the unit tests in packages/shared can run it (src/ai/course-image.test.ts).

export interface CoverSubject {
  /** The course name as typed: "DCA", "Tally Prime". */
  title: string;
  /** What the name stands for: "Diploma in Computer Applications". */
  description: string;
  /** Extra words from the admin for what to show. */
  details: string;
}

/**
 * One take per picture: the model takes no seed, so the four differ by style and what is in
 * view. None shows a face: generated faces are the first thing that looks wrong. The computers
 * are black PCs with a tower because a "desktop computer" comes out as a white all-in-one with
 * its maker's logo on it. In the photograph the monitor is out of focus, which blurs the label a
 * real monitor carries, and the wall is plain because a classroom brings a whiteboard full of
 * scribbles.
 */
export const COVER_VIEWS = [
  'Flat vector illustration of a desktop PC with a black monitor on a black stand, a tower case, a keyboard and a mouse on a tidy desk',
  'Isometric 3D illustration of an open dark grey laptop on a desk with a notebook, a pen and a cup of tea',
  'Realistic photograph, close up from the side, of hands typing on a black keyboard, with a black PC monitor out of focus behind them and a softly blurred plain wall, no faces',
  'Simple bold illustration of a large keyboard key and a PC monitor with a plain black frame and a black stand, made of plain shapes, on a solid deep indigo blue background',
] as const;

export const COVER_VIEW_COUNT = COVER_VIEWS.length;

interface Subject {
  /** Found in the course's name or description, in lower case. */
  words: RegExp;
  /** Things to put beside the computer. */
  things?: string;
  /** What the computer's screen shows, for subjects that are about what is on the screen. */
  screen?: string;
}

/**
 * What to draw for the kinds of course a computer centre runs. The course's own name and
 * description are never sent to the model: it paints any word it is given across the picture,
 * usually misspelt ("Accourtn bellirg" for "Accounting and billing"), and the course's name is
 * printed under the cover anyway. So the words only choose things from this list, and a course
 * that matches nothing gets a plain computer scene, plus whatever the admin asks for.
 */
const SUBJECTS: readonly Subject[] = [
  {
    words: /tally|account|gst|\btax|ledger|book-?keeping|billing|invoice|finance|commerce/,
    things: 'a calculator, an open ledger book with ruled lines and a small stack of coins',
  },
  {
    words: /excel|spreadsheet|data entry|\bmis\b/,
    screen: 'a grid of coloured cells beside a simple bar chart',
  },
  {
    words: /programming|coding|python|java|html|css|php|sql|c\+\+|\bc language|software|database/,
    screen: 'rows of short coloured bars, arranged like lines of computer code',
  },
  {
    words: /typing|typist|steno|shorthand/,
    things: 'a small sand timer and a stack of plain paper',
  },
  {
    words:
      /photoshop|corel|graphic|\bdesign(ing|er)?\b|illustrator|animation|multimedia|video editing|dtp|publishing/,
    things: 'a drawing tablet with a stylus and a fan of colour swatches',
  },
  {
    words: /hardware|repair|assembl|maintenance|chip level/,
    things: 'an open computer case showing a circuit board, with a screwdriver beside it',
  },
  {
    words: /internet|e-?mail|browser|network|cyber|digital|\bweb\b/,
    things: 'a globe with thin connection lines around it',
  },
  { words: /mobile|smartphone|android/, things: 'a smartphone lying on the desk' },
  // Not plain "english": "English typing" is a typing course.
  {
    words: /spoken|speaking|communication|interview|personality/,
    things: 'a headset with a microphone',
  },
  {
    words: /dca|ccc|diploma|certificate|o level|\bbca\b/,
    things: 'a graduation cap and a rolled certificate tied with a ribbon',
  },
];

/** At most this many subjects shape one picture; more only clutter it. */
const MAX_SUBJECTS = 2;

export interface CoverContent {
  things: string[];
  screen: string | null;
}

/** The things to draw for a course, chosen by the words in its name and description. */
export function coverContent(title: string, description: string): CoverContent {
  const text = `${title} ${description}`.toLowerCase();
  const found = SUBJECTS.filter((subject) => subject.words.test(text)).slice(0, MAX_SUBJECTS);
  return {
    things: found.flatMap((subject) => (subject.things ? [subject.things] : [])),
    screen: found.find((subject) => subject.screen)?.screen ?? null,
  };
}

/**
 * Describes the picture: one of the four takes, things that suit the course, what the admin
 * asked to see, the app's colours, and room at the top and bottom because the square picture is
 * shown cropped to 16:9. The words "cover", "course" and "poster" are kept out: they invite a
 * title. The model follows "every sign is blank" better than a list of things not to draw.
 */
export function coverPrompt(subject: CoverSubject, view: number): string {
  const details = subject.details.trim().replace(/[.\s]+$/, '');
  const take = COVER_VIEWS[view] ?? COVER_VIEWS[0];
  const content = coverContent(subject.title, subject.description);

  return [
    take,
    content.things.length > 0 ? `Beside the computer: ${content.things.join(', and ')}` : null,
    details ? `It shows ${details}` : null,
    content.screen
      ? `The computer screen shows ${content.screen}, drawn as plain shapes`
      : 'The computer screen is blank',
    'Colours: deep indigo blue, marigold yellow and white',
    'Wide composition with the subject in the middle and plain empty space above and below',
    'Every sign, wall and sheet of paper is blank',
    'Clean, friendly, high detail',
    'Purely visual: the image contains no words, no letters, no numbers, no logos and no watermark',
  ]
    .filter(Boolean)
    .join('. ')
    .concat('.');
}
