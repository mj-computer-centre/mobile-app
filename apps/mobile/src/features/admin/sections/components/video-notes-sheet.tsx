import type { VideoLesson } from '@mcc/shared';
import { useState } from 'react';

import { pickPdf } from '@/lib/platform/picked-file';
import { Button, Notice, Sheet } from '@/ui';

import { useCreatePdfLesson, useLibraryLessons } from '../../lessons/hooks';
import { ErrorNotice } from '../../shared/error-notice';
import { PickFromListModal } from '../../shared/pick-from-list-modal';
import { useSectionLessons } from '../hooks';

export interface VideoNotesSheetProps {
  sectionId: string;
  video: VideoLesson | null;
  onClose: () => void;
}

/** Topic-wise notes for one video: upload a new PDF, reuse one from the library, or remove it. */
export function VideoNotesSheet({ sectionId, video, onClose }: VideoNotesSheetProps) {
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
    <Sheet visible onClose={onClose} title="Notes for this video" description={video.title}>
      {video.notes ? (
        <Notice tone="primary" icon="paperclip">
          {`Attached now: ${video.notes.title}`}
        </Notice>
      ) : null}
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
      <ErrorNotice error={error} />

      {/* Rendered inside this sheet so it opens over it: iOS presents a second sheet only from within the first. */}
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
    </Sheet>
  );
}
