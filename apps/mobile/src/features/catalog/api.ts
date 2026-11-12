import {
  notesLessonIds,
  toCourseDetail,
  toCourseSummary,
  type CourseDetail,
  type CourseSummary,
  type CourseTreeRow,
  type LessonRow,
} from '@mcc/shared';

import { run } from '@/lib/data';
import { fileUrls } from '@/lib/file-urls';
import { supabase } from '@/lib/supabase';

export const COURSE_FIELDS =
  'id, title, short_description, thumbnail_path, duration_text, original_price_paise, price_paise, is_paid, is_published';
export const LESSON_FIELDS =
  'id, kind, title, youtube_video_id, duration_seconds, thumbnail_url, pdf_path, pdf_size_bytes, notes_lesson_id';

/** Published courses in the owner's chosen order. Staff get drafts too (row-level security). */
export async function fetchCourses(
  options: { includeDrafts?: boolean } = {},
): Promise<CourseSummary[]> {
  let query = supabase().from('courses').select(COURSE_FIELDS);
  if (!options.includeDrafts) query = query.eq('is_published', true);
  const rows = await run(query.order('sort_order').order('created_at'));
  const urls = fileUrls();
  return rows.map((row) => toCourseSummary(row, urls));
}

/**
 * A course with its units and lessons, in two round trips: the tree, then the notes PDFs its
 * videos point to (a self-reference PostgREST cannot embed in the same request).
 */
export async function fetchCourseDetail(courseId: string): Promise<CourseDetail> {
  const db = supabase();
  const tree = (await run(
    db
      .from('courses')
      .select(
        `${COURSE_FIELDS}, about_points,
         course_sections(position, sections(id, title, description,
           section_lessons(position, lessons(${LESSON_FIELDS}))))`,
      )
      .eq('id', courseId)
      .single(),
  )) as unknown as CourseTreeRow; // nested embed: shape asserted here, mapped and unit-tested in @mcc/shared

  const ids = notesLessonIds(tree);
  const notes: LessonRow[] = ids.length
    ? await run(db.from('lessons').select(LESSON_FIELDS).in('id', ids))
    : [];
  return toCourseDetail(tree, new Map(notes.map((row) => [row.id, row])), fileUrls());
}

export interface Banner {
  id: string;
  imageUrl: string;
  courseId: string | null;
}

export async function fetchActiveBanners(): Promise<Banner[]> {
  const rows = await run(
    supabase()
      .from('banners')
      .select('id, image_path, course_id')
      .eq('is_active', true)
      .order('position')
      .order('created_at'),
  );
  const urls = fileUrls();
  return rows.map((row) => ({
    id: row.id,
    imageUrl: urls.mediaUrl(row.image_path),
    courseId: row.course_id,
  }));
}

export interface CourseOption {
  id: string;
  title: string;
}

/** Published course names, for "Which course are you interested in?". */
export async function fetchCourseOptions(): Promise<CourseOption[]> {
  return run(
    supabase().from('courses').select('id, title').eq('is_published', true).order('sort_order'),
  );
}
