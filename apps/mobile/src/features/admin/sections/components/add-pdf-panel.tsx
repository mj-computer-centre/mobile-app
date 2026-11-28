import { formatFileSize } from '@mcc/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { pickPdf, type PickedFile } from '@/lib/platform/picked-file';
import { AppText, Button, Icon, spacing, TextField } from '@/ui';

import { useCreatePdfLesson } from '../../lessons/hooks';
import { ErrorNotice } from '../../shared/error-notice';
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
    <View style={styles.panel}>
      <Button
        label={file ? 'Choose a different PDF' : 'Choose PDF'}
        icon="file-pdf-box"
        variant="secondary"
        onPress={() => void choose()}
      />
      {file ? (
        <>
          <View style={styles.file}>
            <Icon name="file-document-outline" size={20} color="textMuted" />
            <AppText variant="caption" color="textMuted" numberOfLines={2} style={styles.fileName}>
              {file.sizeBytes ? `${file.name} · ${formatFileSize(file.sizeBytes)}` : file.name}
            </AppText>
          </View>
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
      <ErrorNotice error={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.md },
  file: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  fileName: { flex: 1 },
});
