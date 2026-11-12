import { toAppError } from '@mcc/shared';
import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Button, spacing, TextField, useTheme } from '@/ui';

import type { LibraryLesson } from '../lessons/api';
import { useRenameLesson } from '../lessons/hooks';

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
  const { colors } = useTheme();
  const rename = useRenameLesson();
  const [title, setTitle] = useState(lesson.title);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <AppText variant="heading">Rename</AppText>
          <TextField label="Title students see" value={title} onChangeText={setTitle} autoFocus />
          {rename.isError ? (
            <AppText color="danger">{toAppError(rename.error).message}</AppText>
          ) : null}
          <View style={styles.row}>
            <Button label="Cancel" variant="ghost" onPress={onClose} />
            <Button
              label="Save"
              loading={rename.isPending}
              disabled={!title.trim() || title.trim() === lesson.title}
              onPress={() => rename.mutate({ lessonId: lesson.id, title }, { onSuccess: onClose })}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
