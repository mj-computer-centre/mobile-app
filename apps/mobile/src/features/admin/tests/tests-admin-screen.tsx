import type { AdminTest } from '@mcc/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { routes } from '@/lib/routes';
import {
  AppText,
  Button,
  EmptyState,
  ErrorState,
  ListGroup,
  Screen,
  SegmentedControl,
  SkeletonRows,
  spacing,
} from '@/ui';

import { AdminTestRow } from './components/admin-test-row';
import { useAdminTests } from './hooks';

type Tab = 'current' | 'past';

const TABS = [
  { value: 'current', label: 'Current' },
  { value: 'past', label: 'Past' },
] as const;

/** Every test, drafts included: the ones still to run or running, and the ones that are over. */
export function TestsAdminScreen() {
  const tests = useAdminTests();
  const [tab, setTab] = useState<Tab>('current');
  // Read once when the screen opens: enough to sort tests into Current and Past, and it keeps
  // the clock out of rendering.
  const [now] = useState(() => Date.now());

  const all = tests.data ?? [];
  const ended = (test: AdminTest) => Date.parse(test.endsAt) <= now;
  const shown =
    tab === 'current'
      ? // Soonest first: the next test to run is the one staff are preparing.
        all
          .filter((test) => !ended(test))
          .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
      : // The list arrives newest first, which is the order to look back in.
        all.filter(ended);

  return (
    <Screen edges={[]} refreshing={tests.isRefetching} onRefresh={() => void tests.refetch()}>
      <View style={{ gap: spacing.md }}>
        <AppText color="textMuted">
          Tests students take on a timer. Open one to change its details and questions, or see who
          took it.
        </AppText>
        <Button label="New test" icon="plus" onPress={() => router.push(routes.admin.newTest)} />
      </View>

      {tests.isPending ? (
        <SkeletonRows count={4} />
      ) : tests.isError ? (
        <ErrorState error={tests.error} onRetry={() => void tests.refetch()} />
      ) : all.length === 0 ? (
        <EmptyState
          icon="clipboard-text-clock-outline"
          title="No tests yet"
          message="Create a test, add its questions, and choose when students can take it."
          action={{
            label: 'Create the first test',
            onPress: () => router.push(routes.admin.newTest),
          }}
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          <SegmentedControl
            accessibilityLabel="Which tests to show"
            segments={TABS}
            value={tab}
            onChange={setTab}
          />
          {shown.length === 0 ? (
            <AppText color="textMuted">
              {tab === 'current'
                ? 'No test is planned or running. Tests that have ended are under Past.'
                : 'No test has ended yet.'}
            </AppText>
          ) : (
            <ListGroup>
              {shown.map((test) => (
                <AdminTestRow
                  key={test.id}
                  test={test}
                  now={now}
                  onOpen={() => router.push(routes.admin.test(test.id))}
                  onOpenResults={() => router.push(routes.admin.testResults(test.id))}
                />
              ))}
            </ListGroup>
          )}
        </View>
      )}
    </Screen>
  );
}
