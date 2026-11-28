import { formatDuration, formatFileSize, type Lesson } from '@mcc/shared';
import { Pressable, StyleSheet, View, type PressableStateCallbackType } from 'react-native';

import { AppText, Badge, IconChip, spacing, Thumbnail, useTheme } from '@/ui';

const THUMBNAIL_WIDTH = 104;

function describe(lesson: Lesson): string {
  if (lesson.kind === 'pdf')
    return lesson.sizeBytes ? `PDF notes · ${formatFileSize(lesson.sizeBytes)}` : 'PDF notes';
  return lesson.notes ? 'Video · with notes' : 'Video';
}

type RowState = PressableStateCallbackType & { hovered?: boolean };

/** One lesson in a unit: a video with its thumbnail and length, or a PDF. */
export function LessonRow({
  lesson,
  onPress,
  active,
}: {
  lesson: Lesson;
  onPress: () => void;
  /** The lesson playing now, in the list under the player. */
  active?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${lesson.title}, ${describe(lesson)}${active ? ', playing now' : ''}`}
      accessibilityHint={lesson.kind === 'video' ? 'Plays the video' : 'Opens the notes'}
      accessibilityState={{ selected: Boolean(active) }}
      onPress={onPress}
      android_ripple={{ color: colors.surfaceMuted }}
      style={(state: RowState) => [
        styles.row,
        active && { backgroundColor: colors.primarySoft },
        !active && (state.pressed || state.hovered) && { backgroundColor: colors.surfaceMuted },
      ]}>
      {lesson.kind === 'video' ? (
        <Thumbnail
          uri={lesson.thumbnailUrl}
          width={THUMBNAIL_WIDTH}
          fallbackIcon="play-circle-outline"
          caption={lesson.durationSeconds ? formatDuration(lesson.durationSeconds) : undefined}
        />
      ) : (
        <View style={styles.pdf}>
          <IconChip name="file-document-outline" tone="danger" size={44} />
        </View>
      )}
      <View style={styles.text}>
        <AppText variant="bodyStrong" numberOfLines={2}>
          {lesson.title}
        </AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>
          {describe(lesson)}
        </AppText>
        {active ? <Badge label="Playing now" tone="primary" icon="play" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  pdf: { width: THUMBNAIL_WIDTH, alignItems: 'center' },
  text: { flex: 1, gap: 3 },
});
