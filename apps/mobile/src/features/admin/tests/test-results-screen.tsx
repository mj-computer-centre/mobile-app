import { formatWindow, toAppError } from '@mcc/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { showMessage } from '@/lib/platform/confirm';
import { routes } from '@/lib/routes';
import {
  AppText,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  MAX_CONTENT_WIDTH,
  radius,
  spacing,
  SwitchRow,
  TextField,
  useLayout,
  useTheme,
} from '@/ui';

import { ResultRow } from './components/result-row';
import { ResultsFigures } from './components/results-figures';
import { useAdminTest, useExportResults, useSetTestFlags, useTestResults } from './hooks';

/** Everyone who took a test, best score first, and the switch that lets the rest take it late. */
export function TestResultsScreen({ testId }: { testId: string }) {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  const admin = useAdminTest(testId);
  const results = useTestResults(testId);
  const flags = useSetTestFlags(testId);
  const exportCsv = useExportResults();
  const [search, setSearch] = useState('');

  if (admin.isError) return <ErrorState error={admin.error} onRetry={() => void admin.refetch()} />;
  if (results.isError)
    return <ErrorState error={results.error} onRetry={() => void results.refetch()} />;
  if (admin.test === undefined || results.isPending) return <LoadingState />;
  if (admin.test === null) {
    return (
      <EmptyState
        icon="clipboard-remove-outline"
        title="This test no longer exists"
        action={{ label: 'All tests', onPress: () => router.replace(routes.admin.tests) }}
      />
    );
  }

  const test = admin.test;
  const all = results.data;
  // Places come from the whole list, so a student keeps their place while the list is searched.
  const places = new Map(all.map((result, index) => [result.attemptId, index + 1]));
  const needle = search.trim().toLowerCase();
  const rows = all.filter(
    (result) =>
      !needle ||
      [result.fullName, result.phone, result.email].some((value) =>
        value?.toLowerCase().includes(needle),
      ),
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, isWide && styles.contentWide]}
      keyboardShouldPersistTaps="handled"
      data={rows}
      keyExtractor={(result) => result.attemptId}
      refreshing={results.isRefetching}
      onRefresh={() => {
        void results.refetch();
        void admin.refetch();
      }}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.titles}>
            <AppText variant="title" accessibilityRole="header">
              {test.title}
            </AppText>
            <AppText color="textMuted">{formatWindow(test.startsAt, test.endsAt)}</AppText>
          </View>

          <ResultsFigures
            results={all}
            totalMarks={test.totalMarks}
            passPercent={test.passPercent}
          />

          <SwitchRow
            label="Let students who missed it take it later"
            description="Their test is marked as taken late, and they do not get a rank."
            value={test.allowLate}
            disabled={flags.isPending}
            onValueChange={(allowLate) =>
              flags.mutate(
                { allowLate },
                {
                  onError: (error) =>
                    showMessage('Could not change this', toAppError(error).message),
                },
              )
            }
          />

          <Button
            label="Download results (Excel)"
            icon="download"
            variant="secondary"
            loading={exportCsv.isPending}
            disabled={all.length === 0}
            onPress={() =>
              exportCsv.mutate(
                { test, results: all },
                {
                  onError: (error) =>
                    showMessage('Could not download the results', toAppError(error).message),
                },
              )
            }
          />

          {all.length > 0 ? (
            <TextField
              label="Search name, mobile or email"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon={needle ? 'account-search-outline' : 'clipboard-text-off-outline'}
          title={needle ? 'Nobody matches' : 'Nobody has taken this test yet'}
          {...(needle ? {} : { message: 'Students appear here as soon as they start the test.' })}
        />
      }
      renderItem={({ item, index }) => (
        <View
          style={[
            styles.item,
            { backgroundColor: colors.surface, borderColor: colors.border },
            index === 0 && styles.first,
            index === rows.length - 1 && styles.last,
          ]}>
          <ResultRow
            result={item}
            place={places.get(item.attemptId) ?? index + 1}
            questionCount={test.questionCount}
            totalMarks={test.totalMarks}
            onPress={() => router.push(routes.admin.testAttempt(testId, item.attemptId))}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  contentWide: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
  header: { gap: spacing.xl, paddingBottom: spacing.lg },
  titles: { gap: spacing.xs },
  // One surface for the whole list: each row draws its sides, the first and last the corners.
  item: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  first: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  last: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
});
