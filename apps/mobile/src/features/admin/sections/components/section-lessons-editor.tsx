import { formatDuration, moveItem, type Lesson, type VideoLesson } from '@mcc/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { confirmAction } from '@/lib/platform/confirm';
import { AppText, Button, IconButton, IconChip, ListGroup, spacing, Thumbnail } from '@/ui';

import { useLibraryLessons } from '../../lessons/hooks';
import { ErrorNotice } from '../../shared/error-notice';
import { PickFromListModal } from '../../shared/pick-from-list-modal';
import { ReorderControls } from '../../shared/reorder-controls';
import { useSectionLessons } from '../hooks';
import { VideoNotesSheet } from './video-notes-sheet';

const THUMBNAIL_WIDTH = 88;

// A video's length is on its thumbnail, so the line under the title is about its notes.
function describe(lesson: Lesson): string {
  if (lesson.kind === 'pdf') return 'PDF notes';
  return lesson.notes ? `Video · notes: ${lesson.notes.title}` : 'Video · no notes';
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
    <View style={styles.root}>
      {lessons.length === 0 ? (
        <AppText color="textMuted">
          No lessons yet. Add a YouTube playlist or upload a PDF below.
        </AppText>
      ) : (
        <ListGroup>
          {lessons.map((lesson, index) => (
            // The controls drop under the title when a phone is too narrow to hold both, so a
            // long title is never squeezed into a sliver beside four buttons.
            <View key={lesson.id} style={styles.row}>
              <View style={styles.main}>
                {lesson.kind === 'video' ? (
                  <Thumbnail
                    uri={lesson.thumbnailUrl}
                    width={THUMBNAIL_WIDTH}
                    fallbackIcon="play-circle-outline"
                    caption={
                      lesson.durationSeconds ? formatDuration(lesson.durationSeconds) : undefined
                    }
                  />
                ) : (
                  <View style={styles.pdf}>
                    <IconChip name="file-document-outline" tone="danger" size={40} />
                  </View>
                )}
                <View style={styles.text}>
                  <AppText variant="bodyStrong" numberOfLines={2}>
                    {`${index + 1}. ${lesson.title}`}
                  </AppText>
                  <AppText variant="caption" color="textMuted" numberOfLines={2}>
                    {describe(lesson)}
                  </AppText>
                </View>
              </View>
              <View style={styles.controls}>
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
            </View>
          ))}
        </ListGroup>
      )}

      <Button
        label="Add from the library"
        icon="bookshelf"
        variant="secondary"
        loading={attach.isPending}
        onPress={() => setPicking(true)}
      />
      <ErrorNotice error={error} />

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
  root: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  main: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 240,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  pdf: { width: THUMBNAIL_WIDTH, alignItems: 'center' },
  text: { flex: 1, gap: 2 },
  // Pushed to the right edge, on the title's line or on their own.
  controls: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
});
