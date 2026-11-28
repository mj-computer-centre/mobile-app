import { formatDate, formatIndianMobile, toAppError } from '@mcc/shared';
import { useState } from 'react';
import { FlatList, Linking, StyleSheet, View } from 'react-native';

import { showMessage } from '@/lib/platform/confirm';
import {
  AppText,
  Avatar,
  Button,
  Divider,
  EmptyState,
  ErrorState,
  IconButton,
  ListRow,
  MAX_CONTENT_WIDTH,
  radius,
  Screen,
  SkeletonRows,
  spacing,
  TextField,
  useLayout,
  useTheme,
} from '@/ui';

import { useExportStudents, useStudents } from './hooks';

export function StudentsScreen() {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  const students = useStudents();
  const exportCsv = useExportStudents();
  const [search, setSearch] = useState('');

  if (students.isPending) {
    return (
      <Screen edges={[]}>
        <SkeletonRows count={6} />
      </Screen>
    );
  }
  if (students.isError)
    return <ErrorState error={students.error} onRetry={() => void students.refetch()} />;

  const needle = search.trim().toLowerCase();
  const rows = students.data.filter(
    (s) =>
      !needle ||
      [s.full_name, s.phone, s.city, s.email, s.interested_course_title].some((v) =>
        v?.toLowerCase().includes(needle),
      ),
  );
  const total = students.data.length;
  const exportButton = (
    <Button
      label="Download list (Excel)"
      icon="download"
      variant="secondary"
      loading={exportCsv.isPending}
      disabled={total === 0}
      onPress={() =>
        exportCsv.mutate(students.data, {
          onError: (error) => showMessage('Could not export', toAppError(error).message),
        })
      }
    />
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, isWide && styles.contentWide]}
      data={rows}
      keyExtractor={(s, index) => s.id ?? String(index)}
      keyboardShouldPersistTaps="handled"
      refreshing={students.isRefetching}
      onRefresh={() => void students.refetch()}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.grow}>
              <AppText variant="title" accessibilityRole="header">
                {total} student{total === 1 ? '' : 's'}
              </AppText>
              <AppText color="textMuted">Everyone who signed up in the app, newest first.</AppText>
            </View>
            {isWide ? exportButton : null}
          </View>
          {isWide ? null : exportButton}
          <TextField
            label="Search name, mobile, village or course"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon="account-search-outline"
          title={needle ? 'Nobody matches' : 'No students yet'}
          message={
            needle ? undefined : 'Students appear here as soon as they sign in and fill the form.'
          }
        />
      }
      renderItem={({ item: s, index }) => {
        const name = s.full_name || s.email || 'Unnamed';
        return (
          // Every row carries the sides of one shared surface; the first and last close it.
          // Drawing it per row keeps the list virtualised however many students there are.
          <View
            style={[
              styles.item,
              { backgroundColor: colors.surface, borderColor: colors.border },
              index === 0 && styles.first,
              index === rows.length - 1 && styles.last,
            ]}>
            {index > 0 ? <Divider /> : null}
            <ListRow
              title={name}
              subtitle={[
                s.phone ? formatIndianMobile(s.phone) : null,
                s.city,
                s.interested_course_title,
                s.created_at ? `joined ${formatDate(s.created_at)}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              leading={<Avatar name={name} />}
              trailing={
                s.phone ? (
                  <IconButton
                    icon="phone"
                    label={`Call ${s.full_name ?? 'student'}`}
                    color="primary"
                    onPress={() => void Linking.openURL(`tel:+91${s.phone}`)}
                  />
                ) : undefined
              }
            />
          </View>
        );
      }}
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
  contentWide: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  header: { gap: spacing.lg, paddingBottom: spacing.xl },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  grow: { flex: 1, gap: spacing.xs },
  item: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  first: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  last: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
});
