import { describe, expect, it } from 'vitest';

import { notesLessonIds, toCourseDetail, type CourseTreeRow, type LessonRow } from './mappers';
import { findLessonContext, firstVideo, totalVideoSeconds, unitLabel } from './units';

const urls = {
  mediaUrl: (path: string) => `https://cdn.test/media/${path}`,
  notesUrl: (path: string) => `https://cdn.test/notes/${path}`,
};

function video(
  id: string,
  youtubeId: string,
  notes: string | null = null,
  seconds = 300,
): LessonRow {
  return {
    id,
    kind: 'video',
    title: `Video ${id}`,
    youtube_video_id: youtubeId,
    duration_seconds: seconds,
    thumbnail_url: null,
    pdf_path: null,
    pdf_size_bytes: null,
    notes_lesson_id: notes,
  };
}

function pdf(id: string): LessonRow {
  return {
    id,
    kind: 'pdf',
    title: `Notes ${id}`,
    youtube_video_id: null,
    duration_seconds: null,
    thumbnail_url: null,
    pdf_path: `${id}.pdf`,
    pdf_size_bytes: 1024,
    notes_lesson_id: null,
  };
}

// Positions are deliberately out of order to prove sorting.
const tree: CourseTreeRow = {
  id: 'adca',
  title: 'ADCA',
  short_description: 'Advanced diploma',
  thumbnail_path: 'courses/adca/cover.jpg',
  duration_text: '12 months',
  original_price_paise: 1499900,
  price_paise: 0,
  is_paid: false,
  is_published: true,
  about_points: ['12 months', 'Certificate'],
  course_sections: [
    {
      position: 1,
      sections: {
        id: 'word',
        title: 'MS Word',
        description: '',
        section_lessons: [
          { position: 1, lessons: pdf('word-notes') },
          { position: 0, lessons: video('v3', 'ccccccccccc') },
        ],
      },
    },
    {
      position: 0,
      sections: {
        id: 'fundamentals',
        title: 'Fundamentals of Computer',
        description: 'Start here',
        section_lessons: [
          { position: 0, lessons: video('v1', 'aaaaaaaaaaa', 'v1-notes', 296) },
          { position: 1, lessons: video('v2', 'bbbbbbbbbbb', null, 444) },
          { position: 2, lessons: null }, // hidden from this viewer by row-level security
        ],
      },
    },
  ],
};

const notesById = new Map([['v1-notes', pdf('v1-notes')]]);
const course = toCourseDetail(tree, notesById, urls);

describe('toCourseDetail', () => {
  it('orders units and lessons by position and labels units from 1', () => {
    expect(course.units.map((unit) => unit.label)).toEqual([
      'Unit 1 – Fundamentals of Computer',
      'Unit 2 – MS Word',
    ]);
    expect(course.units[1]?.lessons.map((lesson) => lesson.id)).toEqual(['v3', 'word-notes']);
  });

  it('drops lessons the viewer cannot see', () => {
    expect(course.units[0]?.lessons).toHaveLength(2);
  });

  it('attaches topic notes to their video and builds file URLs', () => {
    const first = course.units[0]?.lessons[0];
    expect(first?.kind === 'video' && first.notes?.pdfUrl).toBe(
      'https://cdn.test/notes/v1-notes.pdf',
    );
    expect(course.imageUrl).toBe('https://cdn.test/media/courses/adca/cover.jpg');
  });

  it('falls back to YouTube’s thumbnail', () => {
    const first = course.units[0]?.lessons[0];
    expect(first?.kind === 'video' && first.thumbnailUrl).toBe(
      'https://i.ytimg.com/vi/aaaaaaaaaaa/hqdefault.jpg',
    );
  });
});

describe('course navigation', () => {
  it('lists the notes PDFs to fetch', () => {
    expect(notesLessonIds(tree)).toEqual(['v1-notes']);
  });

  it('finds the first video', () => {
    expect(firstVideo(course)?.id).toBe('v1');
  });

  it('plays the next video, crossing into the next unit and skipping PDFs', () => {
    expect(findLessonContext(course, 'v1')?.nextVideo?.id).toBe('v2');
    expect(findLessonContext(course, 'v2')?.nextVideo?.id).toBe('v3');
    expect(findLessonContext(course, 'v3')?.nextVideo).toBeNull();
  });

  it('returns null for a lesson that is not in the course', () => {
    expect(findLessonContext(course, 'missing')).toBeNull();
  });

  it('adds up video time', () => {
    expect(totalVideoSeconds(course)).toBe(296 + 444 + 300);
  });

  it('numbers units the way people count', () => {
    expect(unitLabel(0, 'Internet')).toBe('Unit 1 – Internet');
  });
});
