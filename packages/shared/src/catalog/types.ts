/** What screens work with. Repositories map database rows into these (see mappers.ts). */

export interface CourseSummary {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string | null;
  durationText: string;
  /** Crossed-out "was" price on the card, in paise. */
  originalPricePaise: number | null;
  pricePaise: number;
  isPaid: boolean;
  isPublished: boolean;
}

export interface PdfLesson {
  kind: 'pdf';
  id: string;
  title: string;
  pdfUrl: string;
  sizeBytes: number | null;
}

export interface VideoLesson {
  kind: 'video';
  id: string;
  title: string;
  youtubeVideoId: string;
  durationSeconds: number | null;
  thumbnailUrl: string;
  /** Topic-wise notes attached to this video, when there are any the viewer may see. */
  notes: PdfLesson | null;
}

export type Lesson = VideoLesson | PdfLesson;

/** A section as it appears inside one course. The same section can be a unit of many courses. */
export interface Unit {
  sectionId: string;
  title: string;
  description: string;
  position: number;
  /** "Unit 3 – MS Word", numbered by this course's order. */
  label: string;
  lessons: Lesson[];
}

export interface CourseDetail extends CourseSummary {
  aboutPoints: string[];
  units: Unit[];
}

export interface LessonContext {
  course: CourseDetail;
  unit: Unit;
  lesson: Lesson;
  /** The next video in course order, for auto-play; null at the end of the course. */
  nextVideo: VideoLesson | null;
}
