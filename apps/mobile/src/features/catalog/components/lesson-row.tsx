import { formatDuration, formatFileSize, type Lesson } from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { Icon, ListRow, spacing, Thumbnail } from '@/ui';

function subtitle(lesson: Lesson): string {
  if (lesson.kind === 'pdf')
    return lesson.sizeBytes ? `PDF notes · ${formatFileSize(lesson.sizeBytes)}` : 'PDF notes';
  const parts = ['Video'];
  if (lesson.durationSeconds) parts.push(formatDuration(lesson.durationSeconds));
  if (lesson.notes) parts.push('with notes');
  return parts.join(' · ');
}

export function LessonRow({
  lesson,
  onPress,
  active,
}: {
  lesson: Lesson;
  onPress: () => void;
  active?: boolean;
}) {
  const leading =
    lesson.kind === 'video' ? (
      <Thumbnail uri={lesson.thumbnailUrl} width={96} fallbackIcon="play-circle-outline" />
    ) : (
      <View style={styles.pdfIcon}>
        <Icon name="file-pdf-box" size={32} color="danger" />
      </View>
    );

  return (
    <ListRow
      title={lesson.title}
      subtitle={active ? `Now playing · ${subtitle(lesson)}` : subtitle(lesson)}
      leading={leading}
      onPress={onPress}
      accessibilityHint={lesson.kind === 'video' ? 'Plays the video' : 'Opens the notes'}
    />
  );
}

const styles = StyleSheet.create({
  pdfIcon: { width: 96, alignItems: 'center', paddingVertical: spacing.sm },
});
