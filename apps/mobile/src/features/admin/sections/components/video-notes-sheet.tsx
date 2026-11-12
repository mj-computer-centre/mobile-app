import { toAppError, type VideoLesson } from '@mcc/shared';
import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pickPdf } from '@/lib/platform/picked-file';
import { AppText, Button, spacing, useTheme } from '@/ui';

import { useCreatePdfLesson, useLibraryLessons } from '../../lessons/hooks';
import { PickFromListModal } from '../../shared/pick-from-list-modal';
import { useSectionLessons } from '../hooks';

export interface VideoNotesSheetProps {
  sectionId: string;
  video: VideoLesson | null;
  onClose: () => void;
}

/** Topic-wise notes for one video: upload a new PDF, reuse one from the library, or remove it. */
export function VideoNotesSheet({ sectionId, video, onClose }: VideoNotesSheetProps) {
  const { colors } = useTheme();
  const { setNotes } = useSectionLessons(sectionId);
  const create = useCreatePdfLesson();
  const library = useLibraryLessons();
  const [choosing, setChoosing] = useState(false);
  const error = create.error ?? setNotes.error;

  if (!video) return null;

  const uploadNew = async () => {
    const file = await pickPdf();
    if (!file) return;
    const notesId = await create.mutateAsync({ file, title: `${video.title} – notes` });
    await setNotes.mutateAsync({ videoId: video.id, notesId });
    onClose();
  };

  const pdfs = library.data
    ?.filter((lesson) => lesson.kind === 'pdf')
    .map((lesson) => ({ id: lesson.id, title: lesson.title }));

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.body}>
          <AppText variant="heading">Notes for this video</AppText>
          <AppText color="textMuted">{video.title}</AppText>
          {video.notes ? <AppText>Attached now: {video.notes.title}</AppText> : null}

          <Button
            label="Upload a new PDF"
            icon="upload"
            loading={create.isPending}
            onPress={() => void uploadNew().catch(() => undefined)}
          />
          <Button
            label="Choose a PDF from the library"
            icon="bookshelf"
            variant="secondary"
            onPress={() => setChoosing(true)}
          />
          {video.notes ? (
            <Button
              label="Remove notes from this video"
              icon="close"
              variant="danger"
              loading={setNotes.isPending}
              onPress={() =>
                setNotes.mutate({ videoId: video.id, notesId: null }, { onSuccess: onClose })
              }
            />
          ) : null}
          {error ? <AppText color="danger">{toAppError(error).message}</AppText> : null}
          <Button label="Close" variant="ghost" onPress={onClose} />
        </View>

        <PickFromListModal
          visible={choosing}
          title="Choose notes PDF"
          items={pdfs}
          emptyMessage="No PDFs in the library yet."
          onPick={(notesId) =>
            setNotes.mutate({ videoId: video.id, notesId }, { onSuccess: onClose })
          }
          onClose={() => setChoosing(false)}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: spacing.lg, gap: spacing.md },
});
