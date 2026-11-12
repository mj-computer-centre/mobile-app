import { lessonsInOrder, type CourseDetail, type PdfLesson } from '@mcc/shared';

/** A PDF in a course, whether it is a unit's notes or the notes attached to a video. */
export function findPdf(course: CourseDetail, lessonId: string): PdfLesson | null {
  for (const { lesson } of lessonsInOrder(course)) {
    if (lesson.kind === 'pdf' && lesson.id === lessonId) return lesson;
    if (lesson.kind === 'video' && lesson.notes?.id === lessonId) return lesson.notes;
  }
  return null;
}
