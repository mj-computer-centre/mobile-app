import {
  courseFormToRow,
  courseImageRequestSchema,
  courseImageResponseSchema,
  type CourseFormValues,
  type CourseImageRequest,
  type SectionFormValues,
  type TableRow,
} from '@mcc/shared';

import { demoCoverPicture } from '@/dev/demo-covers';
import { invokeFunction, run, runVoid } from '@/lib/data';
import { devBypass } from '@/lib/dev-bypass';
import type { PickedFile } from '@/lib/platform/picked-file';
import { supabase } from '@/lib/supabase';

import { removeImages, storeImage } from '../shared/uploads';

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
  await removeImages([course.thumbnail_path]);
}

/**
 * Stores a new cover picture, points the course at it, then removes the old one. The picture
 * is one the admin uploaded or one drawn by AI: both arrive as a picked file.
 */
export async function replaceCourseImage(
  course: Pick<CourseRecord, 'id' | 'thumbnail_path'>,
  file: PickedFile,
): Promise<void> {
  const url = await storeImage('course', file);
  try {
    await runVoid(supabase().from('courses').update({ thumbnail_path: url }).eq('id', course.id));
  } catch (error) {
    await removeImages([url]);
    throw error;
  }
  await removeImages([course.thumbnail_path]);
}

/** Takes the cover picture off the course: students see its coloured panel again. */
export async function clearCourseImage(
  course: Pick<CourseRecord, 'id' | 'thumbnail_path'>,
): Promise<void> {
  await runVoid(supabase().from('courses').update({ thumbnail_path: null }).eq('id', course.id));
  await removeImages([course.thumbnail_path]);
}

/**
 * One AI picture for a course's cover, as a data URL. Nothing is stored: the picture the admin
 * chooses is saved like an uploaded one. The dev bypass has no functions to call, so it gets a
 * stand-in drawing.
 */
export async function drawCoverPicture(request: CourseImageRequest): Promise<string> {
  const body = courseImageRequestSchema.parse(request);
  if (devBypass) return demoCoverPicture(body.view);
  const { image } = await invokeFunction(
    'course-image',
    body,
    courseImageResponseSchema,
    'ai_images_not_set_up',
  );
  return image;
}

export interface CreatedCourse {
  courseId: string;
  /** False when the course was created but its cover picture could not be stored. */
  coverSaved: boolean;
}

/**
 * Creates the course and then stores the cover chosen with it. The picture comes second because
 * it needs the course to exist; when it fails the course stays, and the admin adds the picture
 * again from the course's page.
 */
export async function createCourseWithCover(
  values: CourseFormValues,
  cover: PickedFile | null,
): Promise<CreatedCourse> {
  const courseId = await createCourse(values);
  if (!cover) return { courseId, coverSaved: true };
  try {
    await replaceCourseImage({ id: courseId, thumbnail_path: null }, cover);
    return { courseId, coverSaved: true };
  } catch {
    return { courseId, coverSaved: false };
  }
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
