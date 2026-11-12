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
  spacing,
  TextField,
  useTheme,
} from '@/ui';

import { useExportStudents, useStudents } from './hooks';

function joined(iso: string | null): string {
  return iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
}

export function StudentsScreen() {
  const { colors } = useTheme();
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

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={rows}
      keyExtractor={(s, index) => s.id ?? String(index)}
      refreshing={students.isRefetching}
      onRefresh={() => void students.refetch()}
      ListHeaderComponent={
        <View style={styles.header}>
          <AppText variant="title">{students.data.length} students</AppText>
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
      renderItem={({ item: s }) => (
        <ListRow
          title={s.full_name || s.email || 'Unnamed'}
          subtitle={[
            s.phone ? formatIndianMobile(s.phone) : null,
            s.city,
            s.interested_course_title,
            `joined ${joined(s.created_at)}`,
          ]
            .filter(Boolean)
            .join(' · ')}
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
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, gap: spacing.md },
});
