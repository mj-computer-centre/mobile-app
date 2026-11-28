/**
 * Database rows → screen models. Kept free of Supabase so they can be unit-tested; the app's
 * repositories pass in the rows they fetched and a function that builds public file URLs.
 */
import type { TableRow } from '../db';
import { IMAGE_WIDTHS } from '../images/image-url';
import { byPosition, unitLabel } from './units';
import type { CourseDetail, CourseSummary, Lesson, PdfLesson, Unit } from './types';
import { youtubeThumbnailUrl } from '../youtube/thumbnail';

export type CourseRow = Pick<
  TableRow<'courses'>,
  | 'id'
  | 'title'
  | 'short_description'
  | 'thumbnail_path'
  | 'duration_text'
  | 'original_price_paise'
  | 'price_paise'
  | 'is_paid'
  | 'is_published'
>;

export type LessonRow = Pick<
  TableRow<'lessons'>,
  | 'id'
  | 'kind'
  | 'title'
  | 'youtube_video_id'
  | 'duration_seconds'
  | 'thumbnail_url'
  | 'pdf_path'
  | 'pdf_size_bytes'
  | 'notes_lesson_id'
>;

/** The nested shape the course query returns (see apps/mobile/src/features/catalog/api). */
export interface CourseTreeRow extends CourseRow {
  about_points: string[];
  course_sections: {
    position: number;
    sections: {
      id: string;
      title: string;
      description: string;
      section_lessons: { position: number; lessons: LessonRow | null }[];
    } | null;
  }[];
}

export interface UrlBuilders {
  /**
   * The URL to show a course cover or banner at. `stored` is what the row holds: a Cloudinary
   * URL, or a path in the media bucket for pictures from before Cloudinary.
   */
  mediaUrl: (stored: string, width: number) => string;
  notesUrl: (path: string) => string;
}

export function toCourseSummary(
  row: CourseRow,
  urls: Pick<UrlBuilders, 'mediaUrl'>,
): CourseSummary {
  return {
    id: row.id,
    title: row.title,
    shortDescription: row.short_description,
    imageUrl: row.thumbnail_path ? urls.mediaUrl(row.thumbnail_path, IMAGE_WIDTHS.cover) : null,
    durationText: row.duration_text,
    originalPricePaise: row.original_price_paise,
    pricePaise: row.price_paise,
    isPaid: row.is_paid,
    isPublished: row.is_published,
  };
}

export function toPdfLesson(row: LessonRow, urls: Pick<UrlBuilders, 'notesUrl'>): PdfLesson | null {
  if (row.kind !== 'pdf' || !row.pdf_path) return null;
  return {
    kind: 'pdf',
    id: row.id,
    title: row.title,
    pdfUrl: urls.notesUrl(row.pdf_path),
    sizeBytes: row.pdf_size_bytes,
  };
}

/** `notesById` holds the PDF rows that videos point to; missing ones are hidden from the viewer. */
export function toLesson(
  row: LessonRow,
  notesById: ReadonlyMap<string, LessonRow>,
  urls: UrlBuilders,
): Lesson | null {
  if (row.kind === 'pdf') return toPdfLesson(row, urls);
  if (!row.youtube_video_id) return null;
  const notesRow = row.notes_lesson_id ? notesById.get(row.notes_lesson_id) : undefined;
  return {
    kind: 'video',
    id: row.id,
    title: row.title,
    youtubeVideoId: row.youtube_video_id,
    durationSeconds: row.duration_seconds,
    thumbnailUrl: row.thumbnail_url ?? youtubeThumbnailUrl(row.youtube_video_id),
    notes: notesRow ? toPdfLesson(notesRow, urls) : null,
  };
}

/** Ids of notes PDFs the course's videos point to, so the caller can fetch them in one query. */
export function notesLessonIds(tree: CourseTreeRow): string[] {
  const ids = new Set<string>();
  for (const link of tree.course_sections) {
    for (const item of link.sections?.section_lessons ?? []) {
      if (item.lessons?.notes_lesson_id) ids.add(item.lessons.notes_lesson_id);
    }
  }
  return [...ids];
}

export function toCourseDetail(
  tree: CourseTreeRow,
  notesById: ReadonlyMap<string, LessonRow>,
  urls: UrlBuilders,
): CourseDetail {
  const units: Unit[] = [...tree.course_sections].sort(byPosition).flatMap((link) => {
    if (!link.sections) return [];
    const lessons = [...link.sections.section_lessons]
      .sort(byPosition)
      .map((item) => (item.lessons ? toLesson(item.lessons, notesById, urls) : null))
      .filter((lesson): lesson is Lesson => lesson !== null);
    return [
      {
        sectionId: link.sections.id,
        title: link.sections.title,
        description: link.sections.description,
        position: link.position,
        label: unitLabel(link.position, link.sections.title),
        lessons,
      },
    ];
  });
  return { ...toCourseSummary(tree, urls), aboutPoints: tree.about_points, units };
}
