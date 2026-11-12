import {
  BUCKETS,
  LIMITS,
  courseFormToRow,
  courseImagePath,
  type CourseFormValues,
  type SectionFormValues,
  type TableRow,
} from '@mcc/shared';

import { run, runVoid } from '@/lib/data';
import { fileExtension, type PickedFile } from '@/lib/platform/picked-file';
import { supabase } from '@/lib/supabase';

import { removeFiles, uploadFile } from '../shared/uploads';

export type CourseRecord = TableRow<'courses'>;

export async function fetchCourseRecord(courseId: string): Promise<CourseRecord> {
  return run(supabase().from('courses').select('*').eq('id', courseId).single());
}

export async function createCourse(values: CourseFormValues): Promise<string> {
  const row = await run(
    supabase().from('courses').insert(courseFormToRow(values)).select('id').single(),
  );
  return row.id;
}

export async function updateCourse(courseId: string, values: CourseFormValues): Promise<void> {
  await runVoid(supabase().from('courses').update(courseFormToRow(values)).eq('id', courseId));
}

export async function setCoursePublished(courseId: string, isPublished: boolean): Promise<void> {
  await runVoid(
    supabase().from('courses').update({ is_published: isPublished }).eq('id', courseId),
  );
}

/** Deletes the course and its unit links. The units and lessons stay in the library. */
export async function deleteCourse(
  course: Pick<CourseRecord, 'id' | 'thumbnail_path'>,
): Promise<void> {
  await runVoid(supabase().from('courses').delete().eq('id', course.id));
  if (course.thumbnail_path) await removeFiles(BUCKETS.media, [course.thumbnail_path]);
}

/** Uploads a new cover picture, points the course at it, then removes the old one. */
export async function replaceCourseImage(
  course: Pick<CourseRecord, 'id' | 'thumbnail_path'>,
  file: PickedFile,
) {
  const path = courseImagePath(course.id, `${Date.now()}.${fileExtension(file)}`);
  await uploadFile(BUCKETS.media, path, file, LIMITS.imageBytes);
  await runVoid(supabase().from('courses').update({ thumbnail_path: path }).eq('id', course.id));
  if (course.thumbnail_path) await removeFiles(BUCKETS.media, [course.thumbnail_path]);
}

/** Saves the order of the course list (index = position). */
export async function saveCourseOrder(courseIds: string[]): Promise<void> {
  const db = supabase();
  await Promise.all(
    courseIds.map((id, index) =>
      runVoid(db.from('courses').update({ sort_order: index }).eq('id', id)),
    ),
  );
}

export async function attachSection(courseId: string, sectionId: string): Promise<void> {
  await run(supabase().rpc('attach_section', { p_course_id: courseId, p_section_id: sectionId }));
}

export async function detachSection(courseId: string, sectionId: string): Promise<void> {
  await runVoid(
    supabase().rpc('detach_section', { p_course_id: courseId, p_section_id: sectionId }),
  );
}

export async function reorderSections(courseId: string, sectionIds: string[]): Promise<void> {
  await runVoid(
    supabase().rpc('reorder_course_sections', { p_course_id: courseId, p_section_ids: sectionIds }),
  );
}

/** Creates a new unit and adds it at the end of the course. Returns the unit's id. */
export async function createSectionInCourse(
  courseId: string,
  values: SectionFormValues,
): Promise<string> {
  const section = await run(
    supabase()
      .from('sections')
      .insert({ title: values.title.trim(), description: values.description.trim() })
      .select('id')
      .single(),
  );
  await attachSection(courseId, section.id);
  return section.id;
}
