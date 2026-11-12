import { formatDuration, moveItem, toAppError, type Lesson, type VideoLesson } from '@mcc/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { confirmAction } from '@/lib/platform/confirm';
import { AppText, Button, Icon, IconButton, ListRow, spacing, Thumbnail } from '@/ui';

import { useLibraryLessons } from '../../lessons/hooks';
import { PickFromListModal } from '../../shared/pick-from-list-modal';
import { ReorderControls } from '../../shared/reorder-controls';
import { useSectionLessons } from '../hooks';
import { VideoNotesSheet } from './video-notes-sheet';

function describe(lesson: Lesson): string {
  if (lesson.kind === 'pdf') return 'PDF notes';
  const parts = ['Video'];
  if (lesson.durationSeconds) parts.push(formatDuration(lesson.durationSeconds));
  parts.push(lesson.notes ? `notes: ${lesson.notes.title}` : 'no notes');
  return parts.join(' · ');
}

export function SectionLessonsEditor({
  sectionId,
  lessons,
}: {
  sectionId: string;
  lessons: Lesson[];
}) {
  const { attach, detach, reorder } = useSectionLessons(sectionId);
  const library = useLibraryLessons();
  const [notesFor, setNotesFor] = useState<VideoLesson | null>(null);
  const [picking, setPicking] = useState(false);
  const busy = reorder.isPending || detach.isPending;
  const error = attach.error ?? detach.error ?? reorder.error;

  const inUnit = new Set(lessons.map((lesson) => lesson.id));
  const available = library.data
    ?.filter((lesson) => !inUnit.has(lesson.id))
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      subtitle: lesson.kind === 'video' ? 'Video' : 'PDF',
    }));

  const remove = async (lesson: Lesson) => {
    const ok = await confirmAction({
      title: 'Remove from this unit?',
      message: `“${lesson.title}” stays in the library and in any other unit that uses it.`,
      confirmLabel: 'Remove',
    });
    if (ok) detach.mutate(lesson.id);
  };

  return (
    <View>
      {lessons.length === 0 ? (
        <AppText color="textMuted" style={styles.padded}>
          No lessons yet. Add a YouTube playlist or upload a PDF below.
        </AppText>
      ) : (
        lessons.map((lesson, index) => (
          <ListRow
            key={lesson.id}
            title={`${index + 1}. ${lesson.title}`}
            subtitle={describe(lesson)}
            leading={
              lesson.kind === 'video' ? (
                <Thumbnail uri={lesson.thumbnailUrl} width={72} />
              ) : (
                <Icon name="file-pdf-box" size={30} color="danger" />
              )
            }
            trailing={
              <View style={styles.actions}>
                {lesson.kind === 'video' ? (
                  <IconButton
                    icon="paperclip"
                    label={`Notes for ${lesson.title}`}
                    color="primary"
                    onPress={() => setNotesFor(lesson)}
                  />
                ) : null}
                <ReorderControls
                  itemLabel={lesson.title}
                  index={index}
                  count={lessons.length}
                  disabled={busy}
                  onMove={(from, to) =>
                    reorder.mutate(moveItem(lessons, from, to).map((item) => item.id))
                  }
                  onRemove={() => void remove(lesson)}
                  removeLabel="Remove from unit"
                />
              </View>
            }
          />
        ))
      )}

      <View style={styles.padded}>
        <Button
          label="Add from the library"
          icon="bookshelf"
          variant="secondary"
          loading={attach.isPending}
          onPress={() => setPicking(true)}
        />
        {error ? <AppText color="danger">{toAppError(error).message}</AppText> : null}
      </View>

      <PickFromListModal
        visible={picking}
        title="Add a lesson from the library"
        items={available}
        emptyMessage="Every lesson in the library is already in this unit."
        onPick={(lessonId) => attach.mutate([lessonId])}
        onClose={() => setPicking(false)}
      />
      <VideoNotesSheet sectionId={sectionId} video={notesFor} onClose={() => setNotesFor(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  padded: { padding: spacing.lg, gap: spacing.md },
  actions: { flexDirection: 'row', alignItems: 'center' },
});
