import { courseRowToForm, toAppError } from '@mcc/shared';
import { router, Stack } from 'expo-router';

import { useCourseDetail } from '@/features/catalog';
import { confirmAction, showMessage } from '@/lib/platform/confirm';
import { routes } from '@/lib/routes';
import { Button, ErrorState, LoadingState, Screen } from '@/ui';

import { AdminSection } from '../shared/admin-section';
import { CourseDetailsForm } from './components/course-details-form';
import { CourseUnitsEditor } from './components/course-units-editor';
import { CoverPicker } from './components/cover-picker';
import {
  useClearCourseImage,
  useCourseRecord,
  useDeleteCourse,
  useReplaceCourseImage,
  useUpdateCourse,
} from './hooks';

export function CourseEditorScreen({ courseId }: { courseId: string }) {
  const record = useCourseRecord(courseId);
  const detail = useCourseDetail(courseId);
  const update = useUpdateCourse(courseId);
  const replaceImage = useReplaceCourseImage(record.data);
  const clearImage = useClearCourseImage(record.data);
  const remove = useDeleteCourse();

  if (record.isPending || detail.isPending) return <LoadingState />;
  if (record.isError)
    return <ErrorState error={record.error} onRetry={() => void record.refetch()} />;
  if (detail.isError)
    return <ErrorState error={detail.error} onRetry={() => void detail.refetch()} />;
  const course = record.data;

  const confirmRemovePicture = async () => {
    const ok = await confirmAction({
      title: 'Remove the picture?',
      message: 'Students will see the coloured panel with the course’s short name instead.',
      confirmLabel: 'Remove picture',
      destructive: true,
    });
    if (!ok) return;
    clearImage.mutate(undefined, {
      onError: (error) => showMessage('Could not remove the picture', toAppError(error).message),
    });
  };

  const confirmDelete = async () => {
    const ok = await confirmAction({
      title: `Delete ${course.title}?`,
      message: 'Students will no longer see it. Its units and lessons stay in the library.',
      confirmLabel: 'Delete course',
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(course, {
      onSuccess: () => router.replace(routes.admin.home),
      onError: (error) => showMessage('Could not delete the course', toAppError(error).message),
    });
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: course.title }} />

      <AdminSection
        title="Cover picture"
        description="Shown on the course card, cropped to 16:9. Upload one, or have AI draw it.">
        <CoverPicker
          title={course.title}
          description={course.short_description}
          // While a new picture is being stored, it is already shown.
          imageUri={replaceImage.variables?.uri ?? detail.data.imageUrl}
          busy={replaceImage.isPending || clearImage.isPending}
          onPick={(picture) =>
            replaceImage.mutate(picture, {
              // The picture on show goes back to the saved one.
              onSettled: () => replaceImage.reset(),
              onError: (error) =>
                showMessage('Could not save the picture', toAppError(error).message),
            })
          }
          onRemove={course.thumbnail_path ? () => void confirmRemovePicture() : undefined}
        />
      </AdminSection>

      <AdminSection title="Details">
        <CourseDetailsForm
          key={course.updated_at}
          initialValues={courseRowToForm(course)}
          submitLabel="Save changes"
          disableUntilChanged
          saving={update.isPending}
          error={update.error}
          onSubmit={(values) => update.mutate(values)}
        />
      </AdminSection>

      <AdminSection
        title="Units"
        description="Each unit holds videos and PDFs. Units can be shared between courses."
        bare>
        <CourseUnitsEditor courseId={courseId} units={detail.data.units} />
      </AdminSection>

      <Button
        label="Delete course"
        icon="delete-outline"
        variant="danger"
        loading={remove.isPending}
        onPress={() => void confirmDelete()}
      />
    </Screen>
  );
}
