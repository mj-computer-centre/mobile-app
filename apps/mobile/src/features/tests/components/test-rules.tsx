import { formatDayAndDate, formatMinutes, formatTime, type TestInfo } from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { AppText, Icon, spacing } from '@/ui';

/**
 * What a student should know before starting: the centre's own instructions, then the rules
 * that hold for every test. The wording changes for a test taken late, which gets its full
 * time but is marked.
 */
export function TestRules({
  test,
  late = false,
  title = 'Before you start',
}: {
  test: Pick<TestInfo, 'description' | 'durationMinutes' | 'endsAt'>;
  /** The test's window is over and it is being taken late. */
  late?: boolean;
  title?: string;
}) {
  const minutes = formatMinutes(test.durationMinutes);
  const rules = [
    'The clock starts when you press Start. It cannot be paused.',
    late
      ? `You get the full ${minutes}. Your attempt is marked as taken late.`
      : `You get ${minutes}, or until the test closes on ${formatDayAndDate(test.endsAt)} at ${formatTime(test.endsAt)} if that comes first.`,
    'Your answers are saved as you go. If the app closes, open the test again and carry on while your time lasts.',
    'You can take this test once.',
  ];

  return (
    <View style={styles.block}>
      <AppText variant="heading" accessibilityRole="header">
        {title}
      </AppText>
      {test.description ? <AppText>{test.description}</AppText> : null}
      <View style={styles.rules}>
        {rules.map((rule) => (
          <View key={rule} style={styles.rule}>
            <Icon name="circle-medium" size={20} color="textMuted" />
            <AppText style={styles.grow}>{rule}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.md },
  rules: { gap: spacing.sm },
  rule: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  grow: { flex: 1 },
});
