import { formatMinutes, type TestInfo } from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { AppText, Icon, spacing, type IconName } from '@/ui';

/** The size of a test at a glance: questions, marks, minutes, and the pass mark if it has one. */
export function TestFacts({
  test,
}: {
  test: Pick<TestInfo, 'questionCount' | 'totalMarks' | 'durationMinutes' | 'passPercent'>;
}) {
  const facts: { icon: IconName; text: string }[] = [
    {
      icon: 'format-list-numbered',
      text: `${test.questionCount} question${test.questionCount === 1 ? '' : 's'}`,
    },
    {
      icon: 'star-circle-outline',
      text: `${test.totalMarks} mark${test.totalMarks === 1 ? '' : 's'}`,
    },
    { icon: 'timer-outline', text: formatMinutes(test.durationMinutes) },
  ];
  if (test.passPercent !== null)
    facts.push({ icon: 'flag-checkered', text: `Pass mark ${test.passPercent}%` });

  return (
    <View style={styles.facts}>
      {facts.map((fact) => (
        <View key={fact.text} style={styles.fact}>
          <Icon name={fact.icon} size={17} color="textMuted" />
          <AppText variant="caption" color="textMuted">
            {fact.text}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  facts: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: spacing.xs },
  fact: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
