import { courseRowToForm, toAppError } from '@mcc/shared';
import { router, Stack } from 'expo-router';
import { View } from 'react-native';

import { useCourseDetail } from '@/features/catalog';
import { confirmAction, showMessage } from '@/lib/platform/confirm';
import { pickImage } from '@/lib/platform/picked-file';
import { routes } from '@/lib/routes';
import { Button, ErrorState, LoadingState, Screen, spacing, Thumbnail } from '@/ui';

import { AdminSection } from '../shared/admin-section';
import { CourseDetailsForm } from './components/course-details-form';
import { CourseUnitsEditor } from './components/course-units-editor';
import { useCourseRecord, useDeleteCourse, useReplaceCourseImage, useUpdateCourse } from './hooks';

export function CourseEditorScreen({ courseId }: { courseId: string }) {
  const record = useCourseRecord(courseId);
  const detail = useCourseDetail(courseId);
  const update = useUpdateCourse(courseId);
  const replaceImage = useReplaceCourseImage(record.data);
  const remove = useDeleteCourse();

  if (record.isPending || detail.isPending) return <LoadingState />;
  if (record.isError)
    return <ErrorState error={record.error} onRetry={() => void record.refetch()} />;
  if (detail.isError)
    return <ErrorState error={detail.error} onRetry={() => void detail.refetch()} />;
  const course = record.data;

  const changePicture = async () => {
    const file = await pickImage();
    if (!file) return;
    replaceImage.mutate(file, {
      onError: (error) => showMessage('Could not upload the picture', toAppError(error).message),
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
        description="Shown on the course card. A 16:9 picture works best.">
        <View style={{ gap: spacing.md }}>
          <Thumbnail uri={detail.data.imageUrl} fallbackIcon="image-plus" />
          <Button
            label={course.thumbnail_path ? 'Change picture' : 'Add picture'}
            icon="image"
            variant="secondary"
            loading={replaceImage.isPending}
            onPress={() => void changePicture()}
          />
        </View>
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
        padded={false}>
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
