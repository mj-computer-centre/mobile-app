import { formatFileSize, toAppError } from '@mcc/shared';
import { useState } from 'react';
import { View } from 'react-native';

import { pickPdf, type PickedFile } from '@/lib/platform/picked-file';
import { AppText, Button, spacing, TextField } from '@/ui';

import { useCreatePdfLesson } from '../../lessons/hooks';
import { useSectionLessons } from '../hooks';

function titleFromFileName(name: string): string {
  return name
    .replace(/\.pdf$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();
}

/** Unit-wise notes: upload a PDF straight into this unit. */
export function AddPdfPanel({ sectionId }: { sectionId: string }) {
  const [file, setFile] = useState<PickedFile | null>(null);
  const [title, setTitle] = useState('');
  const create = useCreatePdfLesson();
  const { attach } = useSectionLessons(sectionId);
  const error = create.error ?? attach.error;

  const choose = async () => {
    const picked = await pickPdf();
    if (!picked) return;
    setFile(picked);
    setTitle(titleFromFileName(picked.name));
  };

  const upload = async () => {
    if (!file) return;
    const lessonId = await create.mutateAsync({
      file,
      title: title || titleFromFileName(file.name),
    });
    await attach.mutateAsync([lessonId]);
    setFile(null);
    setTitle('');
  };

  return (
    <View style={{ gap: spacing.md }}>
      <Button
        label={file ? 'Choose a different PDF' : 'Choose PDF'}
        icon="file-pdf-box"
        variant="secondary"
        onPress={() => void choose()}
      />
      {file ? (
        <>
          <AppText variant="caption" color="textMuted">
            {file.name}
            {file.sizeBytes ? ` · ${formatFileSize(file.sizeBytes)}` : ''}
          </AppText>
          <TextField label="Title students will see" value={title} onChangeText={setTitle} />
          <Button
            label="Upload to this unit"
            icon="upload"
            loading={create.isPending || attach.isPending}
            disabled={!title.trim()}
            onPress={() => void upload().catch(() => undefined)}
          />
        </>
      ) : null}
      {error ? (
        <AppText color="danger" accessibilityLiveRegion="polite">
          {toAppError(error).message}
        </AppText>
      ) : null}
    </View>
  );
}
