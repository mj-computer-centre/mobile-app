import { Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '../theme';
import { AppText } from './app-text';
import { Icon } from './icon';

/** A heading above a block of content, with an optional link on the right ("See all"). */
export function SectionHeader({
  title,
  description,
  action,
  large = false,
}: {
  title: string;
  description?: string | undefined;
  action?: { label: string; onPress: () => void } | undefined;
  /** A bigger heading, for the sections of a public web page. */
  large?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText variant={large ? 'title' : 'heading'} accessibilityRole="header">
          {title}
        </AppText>
        {description ? (
          <AppText variant={large ? 'body' : 'caption'} color="textMuted">
            {description}
          </AppText>
        ) : null}
      </View>
      {action ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={action.label}
          hitSlop={8}
          onPress={action.onPress}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <AppText variant="label" color="primary">
            {action.label}
          </AppText>
          <Icon name="chevron-right" size={18} color="primary" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  text: { flex: 1, gap: 2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 2 },
  pressed: { opacity: 0.6 },
});
