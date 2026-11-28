import { StyleSheet, View } from 'react-native';

import { AppText, Icon, spacing, type ColorName, type IconName } from '@/ui';

import type { SaveStatus } from '../use-answer-saver';

const COPY: Record<
  Exclude<SaveStatus['state'], 'idle'>,
  { icon: IconName; text: string; color: ColorName }
> = {
  saving: { icon: 'cloud-upload-outline', text: 'Saving…', color: 'textMuted' },
  saved: { icon: 'cloud-check-outline', text: 'Saved', color: 'textMuted' },
  unsaved: {
    icon: 'cloud-off-outline',
    text: 'Not saved yet. Your answers are sent again when you submit.',
    color: 'warning',
  },
};

/**
 * Whether the answers have reached the server, said quietly: a student in the middle of a test
 * should know, but should not be alarmed by a weak signal.
 */
export function SaveStatusLine({ status }: { status: SaveStatus }) {
  if (status.state === 'idle') return null;
  const { icon, text, color } = COPY[status.state];
  return (
    <View style={styles.line} accessibilityLiveRegion="polite">
      <Icon name={icon} size={16} color={color} />
      <AppText variant="caption" color={color} style={styles.text}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
  text: { flexShrink: 1 },
});
