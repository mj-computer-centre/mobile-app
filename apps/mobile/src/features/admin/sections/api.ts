import {
  byPosition,
  toLesson,
  type Lesson,
  type LessonRow,
  type SectionFormValues,
} from '@mcc/shared';

import { LESSON_FIELDS } from '@/features/catalog';
import { run, runVoid } from '@/lib/data';
import { fileUrls } from '@/lib/file-urls';
import { supabase } from '@/lib/supabase';

export interface SectionDetail {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface SectionTreeRow {
  id: string;
  title: string;
  description: string;
  section_lessons: { position: number; lessons: LessonRow | null }[];
}

export async function fetchSectionDetail(sectionId: string): Promise<SectionDetail> {
  const db = supabase();
  const tree = (await run(
    db
      .from('sections')
      .select(`id, title, description, section_lessons(position, lessons(${LESSON_FIELDS}))`)
      .eq('id', sectionId)
      .single(),
  )) as unknown as SectionTreeRow;

  const rows = [...tree.section_lessons]
    .sort(byPosition)
    .flatMap((item) => (item.lessons ? [item.lessons] : []));
  const noteIds = [
    ...new Set(rows.flatMap((row) => (row.notes_lesson_id ? [row.notes_lesson_id] : []))),
  ];
  const notes: LessonRow[] = noteIds.length
    ? await run(db.from('lessons').select(LESSON_FIELDS).in('id', noteIds))
    : [];
  const notesById = new Map(notes.map((row) => [row.id, row]));
  const urls = fileUrls();

  return {
    id: tree.id,
    title: tree.title,
    description: tree.description,
    lessons: rows
      .map((row) => toLesson(row, notesById, urls))
      .filter((lesson): lesson is Lesson => lesson !== null),
  };
}

export async function updateSection(sectionId: string, values: SectionFormValues): Promise<void> {
  await runVoid(
    supabase()
      .from('sections')
      .update({ title: values.title.trim(), description: values.description.trim() })
      .eq('id', sectionId),
  );
}

/** Deletes the unit everywhere it is used. Its lessons stay in the library. */
export async function deleteSection(sectionId: string): Promise<void> {
  await runVoid(supabase().from('sections').delete().eq('id', sectionId));
}

export async function attachLessons(sectionId: string, lessonIds: string[]): Promise<number> {
  if (lessonIds.length === 0) return 0;
  return run(
    supabase().rpc('attach_lessons', { p_section_id: sectionId, p_lesson_ids: lessonIds }),
  );
}

export async function detachLesson(sectionId: string, lessonId: string): Promise<void> {
  await runVoid(
    supabase().rpc('detach_lesson', { p_section_id: sectionId, p_lesson_id: lessonId }),
  );
}

export async function reorderLessons(sectionId: string, lessonIds: string[]): Promise<void> {
  await runVoid(
    supabase().rpc('reorder_section_lessons', { p_section_id: sectionId, p_lesson_ids: lessonIds }),
  );
}

/** Topic-wise notes: attach a PDF lesson to a video, or pass null to remove it. */
export async function setVideoNotes(
  videoLessonId: string,
  notesLessonId: string | null,
): Promise<void> {
  await runVoid(
    supabase().from('lessons').update({ notes_lesson_id: notesLessonId }).eq('id', videoLessonId),
  );
}

export interface LibrarySection {
  id: string;
  title: string;
  description: string;
  courseCount: number;
}

export async function fetchLibrarySections(): Promise<LibrarySection[]> {
  const db = supabase();
  const [sections, usage] = await Promise.all([
    run(db.from('sections').select('id, title, description').order('title')),
    run(db.from('section_usage').select('section_id, course_count')),
  ]);
  const counts = new Map(usage.map((row) => [row.section_id, row.course_count ?? 0]));
  return sections.map((section) => ({ ...section, courseCount: counts.get(section.id) ?? 0 }));
}
