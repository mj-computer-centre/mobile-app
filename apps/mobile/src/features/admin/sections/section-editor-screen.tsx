import { toAppError } from '@mcc/shared';
import { router, Stack } from 'expo-router';

import { confirmAction, showMessage } from '@/lib/platform/confirm';
import { Button, ErrorState, LoadingState, Notice, Screen } from '@/ui';

import { AdminSection } from '../shared/admin-section';
import { AddPdfPanel } from './components/add-pdf-panel';
import { AddYoutubePanel } from './components/add-youtube-panel';
import { SectionDetailsForm } from './components/section-details-form';
import { SectionLessonsEditor } from './components/section-lessons-editor';
import { useDeleteSection, useLibrarySections, useSectionDetail } from './hooks';

export function SectionEditorScreen({ sectionId }: { sectionId: string }) {
  const section = useSectionDetail(sectionId);
  const library = useLibrarySections();
  const remove = useDeleteSection();

  if (section.isPending) return <LoadingState />;
  if (section.isError)
    return <ErrorState error={section.error} onRetry={() => void section.refetch()} />;
  const unit = section.data;
  const courseCount = library.data?.find((item) => item.id === sectionId)?.courseCount ?? 0;

  const confirmDelete = async () => {
    const ok = await confirmAction({
      title: `Delete ${unit.title} everywhere?`,
      message:
        courseCount > 1
          ? `This unit is used in ${courseCount} courses and will disappear from all of them. Its lessons stay in the library.`
          : 'The unit is deleted. Its lessons stay in the library.',
      confirmLabel: 'Delete unit',
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(sectionId, {
      onSuccess: () => router.back(),
      onError: (error) => showMessage('Could not delete the unit', toAppError(error).message),
    });
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: unit.title }} />
      {courseCount > 1 ? (
        <Notice tone="warning" title={`This unit is shared by ${courseCount} courses`}>
          Changes here show up in all of them.
        </Notice>
      ) : null}

      <AdminSection title="Unit details">
        <SectionDetailsForm
          sectionId={sectionId}
          initialValues={{ title: unit.title, description: unit.description }}
        />
      </AdminSection>

      <AdminSection
        title="Lessons"
        description="In the order students see them. The clip icon attaches notes to a video."
        bare>
        <SectionLessonsEditor sectionId={sectionId} lessons={unit.lessons} />
      </AdminSection>

      <AdminSection title="Add YouTube videos" description="Paste one video or a whole playlist.">
        <AddYoutubePanel sectionId={sectionId} />
      </AdminSection>

      <AdminSection title="Add PDF notes for the whole unit">
        <AddPdfPanel sectionId={sectionId} />
      </AdminSection>

      <Button
        label="Delete unit"
        icon="delete-outline"
        variant="danger"
        loading={remove.isPending}
        onPress={() => void confirmDelete()}
      />
    </Screen>
  );
}
