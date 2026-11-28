import { useState } from 'react';

import { Button, Sheet, TextField } from '@/ui';

import type { LibraryLesson } from '../lessons/api';
import { useRenameLesson } from '../lessons/hooks';
import { ErrorNotice } from '../shared/error-notice';

/** React Native has no cross-platform text prompt, so renaming uses a small sheet. */
export function RenameLessonSheet({
  lesson,
  onClose,
}: {
  lesson: LibraryLesson | null;
  onClose: () => void;
}) {
  if (!lesson) return null;
  // Keyed so the field starts from this lesson's title each time the sheet opens.
  return <RenameForm key={lesson.id} lesson={lesson} onClose={onClose} />;
}

function RenameForm({ lesson, onClose }: { lesson: LibraryLesson; onClose: () => void }) {
  const rename = useRenameLesson();
  const [title, setTitle] = useState(lesson.title);

  return (
    <Sheet
      visible
      onClose={onClose}
      title={lesson.kind === 'video' ? 'Rename video' : 'Rename PDF'}
      closeLabel="Cancel">
      <TextField label="Title students see" value={title} onChangeText={setTitle} autoFocus />
      <ErrorNotice error={rename.error} />
      <Button
        label="Save"
        loading={rename.isPending}
        disabled={!title.trim() || title.trim() === lesson.title}
        onPress={() => rename.mutate({ lessonId: lesson.id, title }, { onSuccess: onClose })}
      />
    </Sheet>
  );
}
