import { formatIndianMobile, toAppError } from '@mcc/shared';
import { useState } from 'react';
import { FlatList, Linking, StyleSheet, View } from 'react-native';

import { showMessage } from '@/lib/platform/confirm';
import {
  AppText,
  Button,
  EmptyState,
  ErrorState,
  IconButton,
  ListRow,
  LoadingState,
  MAX_CONTENT_WIDTH,
  radius,
  spacing,
  TextField,
  useLayout,
  useTheme,
} from '@/ui';

import { useExportStudents, useStudents } from './hooks';

function joined(iso: string | null): string {
  return iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
}

function initials(name: string): string {
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export function StudentsScreen() {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  const students = useStudents();
  const exportCsv = useExportStudents();
  const [search, setSearch] = useState('');

  if (students.isPending) return <LoadingState />;
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
  const exportButton = (
    <Button
      label="Download list (Excel)"
      icon="download"
      variant="secondary"
      loading={exportCsv.isPending}
      disabled={students.data.length === 0}
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
      refreshing={students.isRefetching}
      onRefresh={() => void students.refetch()}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.grow}>
              <AppText variant="title">{students.data.length} students</AppText>
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
        />
      }
      renderItem={({ item: s, index }) => {
        const name = s.full_name || s.email || 'Unnamed';
        return (
          <View
            style={[
              styles.item,
              { backgroundColor: colors.surface, borderColor: colors.border },
              index === 0 && styles.first,
              index === rows.length - 1 && styles.last,
            ]}>
            <ListRow
              title={name}
              subtitle={[
                s.phone ? formatIndianMobile(s.phone) : null,
                s.city,
                s.interested_course_title,
                `joined ${joined(s.created_at)}`,
              ]
                .filter(Boolean)
                .join(' · ')}
              leading={
                <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
                  <AppText variant="label" color="primary">
                    {initials(name)}
                  </AppText>
                </View>
              }
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
  },
  contentWide: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.xl },
  header: { gap: spacing.md, paddingBottom: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  grow: { flex: 1, gap: 2 },
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
