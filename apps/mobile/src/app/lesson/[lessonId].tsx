import { useLocalSearchParams } from 'expo-router';

import { LessonScreen } from '@/features/player';

export default function LessonRoute() {
  const { lessonId, courseId, sectionId } = useLocalSearchParams<{
    lessonId: string;
    courseId: string;
    sectionId?: string;
  }>();
  return (
    <LessonScreen lessonId={lessonId} courseId={courseId} {...(sectionId ? { sectionId } : {})} />
  );
}
