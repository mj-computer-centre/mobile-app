import { groupTests, type MyTest } from '@mcc/shared';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { StaffActions, useStaffRole } from '@/features/auth';
import { routes } from '@/lib/routes';
import {
  AppText,
  Button,
  EmptyState,
  ErrorState,
  ListGroup,
  MAX_CONTENT_WIDTH,
  Screen,
  SectionHeader,
  SkeletonRows,
  spacing,
  useLayout,
} from '@/ui';

import { TestRow } from '../components/test-row';
import { useMyTests, useServerNow } from '../hooks';

interface TestSection {
  key: string;
  title: string;
  description?: string;
  tests: MyTest[];
}

/**
 * The Tests tab: every test the centre has published, grouped by what the student can do about
 * it now. The groups follow the clock, so a test moves from "Coming up" to "Open now" by
 * itself.
 */
export function TestsScreen() {
  const tests = useMyTests();
  const staff = useStaffRole() !== null;
  const { isWide } = useLayout();
  const now = useServerNow(tests.data?.clockOffsetMs ?? 0);

  const groups = tests.data ? groupTests(tests.data.tests, now) : null;
  // What can be done now and next; then what is behind the student.
  const ahead: TestSection[] = groups
    ? [
        {
          key: 'now',
          title: 'Open now',
          description: 'Start or carry on before they close.',
          tests: groups.now,
        },
        { key: 'upcoming', title: 'Coming up', tests: groups.upcoming },
      ].filter((section) => section.tests.length > 0)
    : [];
  const behind: TestSection[] = groups
    ? [
        {
          key: 'late',
          title: 'Missed, but still open to you',
          description: 'The centre lets you take these late.',
          tests: groups.late,
        },
        { key: 'past', title: 'Past tests', tests: groups.past },
      ].filter((section) => section.tests.length > 0)
    : [];

  const renderSection = (section: TestSection) => (
    <View key={section.key} style={styles.section}>
      <SectionHeader title={section.title} description={section.description} />
      <ListGroup>
        {section.tests.map((test) => (
          <TestRow
            key={test.id}
            test={test}
            now={now}
            onPress={() => router.push(routes.test(test.id))}
          />
        ))}
      </ListGroup>
    </View>
  );

  return (
    <Screen
      edges={[]}
      width="wide"
      refreshing={tests.isRefetching}
      onRefresh={() => void tests.refetch()}>
      {isWide ? (
        <View style={styles.heading}>
          <AppText variant="title" accessibilityRole="header">
            Tests
          </AppText>
          <AppText color="textMuted">
            Timed tests from the centre. Your score comes as soon as you submit.
          </AppText>
        </View>
      ) : null}

      <StaffActions note="Students do not see this box. Drafts, questions and results are under “Manage tests”.">
        <Button
          label="New test"
          icon="plus"
          compact
          onPress={() => router.push(routes.admin.newTest)}
        />
        <Button
          label="Manage tests"
          icon="clipboard-edit-outline"
          variant="secondary"
          compact
          onPress={() => router.push(routes.admin.tests)}
        />
      </StaffActions>

      {!groups ? (
        tests.isError ? (
          <ErrorState error={tests.error} onRetry={() => void tests.refetch()} />
        ) : (
          <SkeletonRows count={4} />
        )
      ) : ahead.length === 0 && behind.length === 0 ? (
        <EmptyState
          icon="clipboard-text-clock-outline"
          title="No tests yet"
          message={
            staff
              ? 'Press “New test” to set the first one. It shows here once you switch on “Show to students”.'
              : 'When the centre sets a test, it will appear here.'
          }
        />
      ) : isWide && ahead.length > 0 && behind.length > 0 ? (
        // Two columns on a wide screen: what is ahead on the left, what is behind on the right.
        <View style={styles.columns}>
          <View style={styles.column}>{ahead.map(renderSection)}</View>
          <View style={styles.column}>{behind.map(renderSection)}</View>
        </View>
      ) : (
        <View style={[styles.stack, isWide && styles.single]}>
          {[...ahead, ...behind].map(renderSection)}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.xs },
  section: { gap: spacing.md },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxl },
  column: { flex: 1, minWidth: 0, gap: spacing.xl },
  stack: { gap: spacing.xl },
  // One column of rows reads better at a page's width than stretched across a desktop.
  single: { width: '100%', maxWidth: MAX_CONTENT_WIDTH },
});
