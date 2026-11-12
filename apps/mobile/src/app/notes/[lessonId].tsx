import { useLocalSearchParams } from 'expo-router';

import { NotesScreen } from '@/features/notes';

export default function NotesRoute() {
  const { lessonId, courseId } = useLocalSearchParams<{ lessonId: string; courseId: string }>();
  return <NotesScreen lessonId={lessonId} courseId={courseId} />;
}
