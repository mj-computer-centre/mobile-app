// Demo course content for the dev-bypass mode (see src/lib/dev-bypass.ts). Mirrors how the centre
// will set things up: three courses sharing units, videos with topic notes, and unit-wise PDFs.
// Development only; never used in a release bundle.
import {
  formatInr,
  unitLabel,
  youtubeThumbnailUrl,
  type CourseDetail,
  type CourseSummary,
  type Lesson,
  type PdfLesson,
  type TableRow,
  type VideoLesson,
} from '@mcc/shared';

// Public videos that allow embedding: Google's own embed demo, and Blender's Big Buck Bunny.
const VIDEO_A = 'M7lc1UVf-VE';
const VIDEO_B = 'aqz-KE-bpKQ';
// W3C's public test PDF.
const SAMPLE_PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
const CREATED_AT = '2026-10-01T09:00:00.000Z';

export const demoId = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

function pdf(n: number, title: string): PdfLesson {
  return { kind: 'pdf', id: demoId(n), title, pdfUrl: SAMPLE_PDF, sizeBytes: 13264 };
}

function video(
  n: number,
  title: string,
  youtubeVideoId: string,
  durationSeconds: number,
  notes: PdfLesson | null = null,
): VideoLesson {
  return {
    kind: 'video',
    id: demoId(n),
    title,
    youtubeVideoId,
    durationSeconds,
    thumbnailUrl: youtubeThumbnailUrl(youtubeVideoId),
    notes,
  };
}

const computerNotes = pdf(301, 'What is a computer – notes');

const lessons = {
  whatIsComputer: video(201, 'What is a computer?', VIDEO_A, 296, computerNotes),
  inputOutput: video(202, 'Input and output devices', VIDEO_B, 444),
  fundamentalsNotes: pdf(302, 'Fundamentals – complete notes'),
  wordIntro: video(203, 'Getting started with MS Word', VIDEO_A, 362),
  mailMerge: video(204, 'Mail merge step by step', VIDEO_B, 512),
  excelBasics: video(205, 'Excel basics: rows, columns and cells', VIDEO_A, 410),
};

/** Every lesson in the library, including notes attached to videos. */
export const demoLessons: Lesson[] = [...Object.values(lessons), computerNotes];

export interface DemoSection {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

const sections = {
  fundamentals: {
    id: demoId(101),
    title: 'Fundamentals of Computer',
    description: 'Start here.',
    lessons: [lessons.whatIsComputer, lessons.inputOutput, lessons.fundamentalsNotes],
  },
  word: {
    id: demoId(102),
    title: 'MS Word',
    description: '',
    lessons: [lessons.wordIntro, lessons.mailMerge],
  },
  excel: { id: demoId(103), title: 'MS Excel', description: '', lessons: [lessons.excelBasics] },
  tally: {
    id: demoId(104),
    title: 'Tally Prime',
    description: 'Lessons coming soon.',
    lessons: [],
  },
} satisfies Record<string, DemoSection>;

export const demoSections: DemoSection[] = Object.values(sections);

export interface DemoCourse {
  record: TableRow<'courses'>;
  units: DemoSection[];
}

function course(
  n: number,
  title: string,
  shortDescription: string,
  durationText: string,
  originalPricePaise: number,
  isPublished: boolean,
  units: DemoSection[],
): DemoCourse {
  return {
    record: {
      id: demoId(n),
      title,
      short_description: shortDescription,
      duration_text: durationText,
      original_price_paise: originalPricePaise,
      price_paise: 0,
      is_paid: false,
      is_published: isPublished,
      about_points: [
        'Video lessons in Hindi',
        'PDF notes',
        `Worth ${formatInr(originalPricePaise)}, free for now`,
      ],
      sort_order: n,
      thumbnail_path: null,
      created_at: CREATED_AT,
      updated_at: CREATED_AT,
    },
    units,
  };
}

export const demoCourses: DemoCourse[] = [
  course(1, 'Basic Computer', 'Computer basics for beginners', '3 months', 299900, true, [
    sections.fundamentals,
    sections.word,
  ]),
  course(2, 'DCA', 'Diploma in Computer Applications', '6 months', 799900, true, [
    sections.fundamentals,
    sections.word,
    sections.excel,
  ]),
  // A draft: staff see it, students do not.
  course(3, 'ADCA', 'Advanced Diploma in Computer Applications', '12 months', 1499900, false, [
    sections.fundamentals,
    sections.word,
    sections.excel,
    sections.tally,
  ]),
];

export function toSummary({ record }: DemoCourse): CourseSummary {
  return {
    id: record.id,
    title: record.title,
    shortDescription: record.short_description,
    imageUrl: null,
    durationText: record.duration_text,
    originalPricePaise: record.original_price_paise,
    pricePaise: record.price_paise,
    isPaid: record.is_paid,
    isPublished: record.is_published,
  };
}

export function toDetail(demo: DemoCourse): CourseDetail {
  return {
    ...toSummary(demo),
    aboutPoints: demo.record.about_points,
    units: demo.units.map((section, position) => ({
      sectionId: section.id,
      title: section.title,
      description: section.description,
      position,
      label: unitLabel(position, section.title),
      lessons: section.lessons,
    })),
  };
}
