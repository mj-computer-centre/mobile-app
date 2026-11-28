import { Stack } from 'expo-router';

import { useCourseDetail } from '@/features/catalog';
import { EmptyState, ErrorState, LoadingState, Screen } from '@/ui';

import { findPdf } from '../find-pdf';
import { PdfViewer } from '../pdf-viewer';

export function NotesScreen({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const course = useCourseDetail(courseId);

  if (course.isPending) return <LoadingState />;
  if (course.isError)
    return <ErrorState error={course.error} onRetry={() => void course.refetch()} />;

  const pdf = findPdf(course.data, lessonId);
  if (!pdf)
    return (
      <EmptyState
        icon="file-remove-outline"
        title="These notes are no longer available"
        message="The centre may have replaced or removed them."
      />
    );

  return (
    <Screen scroll={false} padded={false} edges={['bottom']}>
      <Stack.Screen options={{ title: pdf.title }} />
      <PdfViewer url={pdf.pdfUrl} cacheKey={`${pdf.id}.pdf`} title={pdf.title} />
    </Screen>
  );
}
