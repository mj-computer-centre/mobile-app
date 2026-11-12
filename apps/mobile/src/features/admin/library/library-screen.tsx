import { toAppError } from '@mcc/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { confirmAction, showMessage } from '@/lib/platform/confirm';
import { routes } from '@/lib/routes';
import {
  Button,
  Card,
  ErrorState,
  Icon,
  IconButton,
  ListRow,
  LoadingState,
  Screen,
  spacing,
  TextField,
} from '@/ui';

import type { LibraryLesson } from '../lessons/api';
import { useDeleteLesson, useLibraryLessons } from '../lessons/hooks';
import { useDeleteSection, useLibrarySections } from '../sections/hooks';
import { RenameLessonSheet } from './rename-lesson-sheet';

type Tab = 'units' | 'lessons';

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export function LibraryScreen() {
  const [tab, setTab] = useState<Tab>('units');
  const [search, setSearch] = useState('');
  const [renaming, setRenaming] = useState<LibraryLesson | null>(null);
  const sections = useLibrarySections();
  const lessons = useLibraryLessons();
  const deleteSection = useDeleteSection();
  const deleteLesson = useDeleteLesson();
  const needle = search.trim().toLowerCase();

  const confirmDeleteSection = async (id: string, title: string, courseCount: number) => {
    const ok = await confirmAction({
      title: `Delete ${title}?`,
      message:
        courseCount > 0
          ? `It is in ${plural(courseCount, 'course')} and will disappear from them.`
          : 'It is not in any course.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (ok)
      deleteSection.mutate(id, {
        onError: (e) => showMessage('Could not delete', toAppError(e).message),
      });
  };

  const confirmDeleteLesson = async (lesson: LibraryLesson) => {
    const used = lesson.sectionCount + lesson.attachedToVideoCount;
    const ok = await confirmAction({
      title: `Delete “${lesson.title}”?`,
      message:
        used > 0
          ? `It is used in ${plural(used, 'place')} and will disappear from all of them.`
          : 'It is not used anywhere.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (ok)
      deleteLesson.mutate(lesson, {
        onError: (e) => showMessage('Could not delete', toAppError(e).message),
      });
  };

  const active = tab === 'units' ? sections : lessons;

  return (
    <Screen edges={[]} refreshing={active.isRefetching} onRefresh={() => void active.refetch()}>
      <View style={styles.tabs}>
        <Button
          label="Units"
          compact
          variant={tab === 'units' ? 'primary' : 'secondary'}
          onPress={() => setTab('units')}
        />
        <Button
          label="Videos and PDFs"
          compact
          variant={tab === 'lessons' ? 'primary' : 'secondary'}
          onPress={() => setTab('lessons')}
        />
      </View>
      <TextField label="Search" value={search} onChangeText={setSearch} autoCorrect={false} />

      {active.isPending ? (
        <LoadingState />
      ) : active.isError ? (
        <ErrorState error={active.error} onRetry={() => void active.refetch()} />
      ) : tab === 'units' ? (
        <Card padded={false}>
          {(sections.data ?? [])
            .filter((s) => !needle || s.title.toLowerCase().includes(needle))
            .map((s) => (
              <ListRow
                key={s.id}
                title={s.title}
                subtitle={
                  s.courseCount ? `In ${plural(s.courseCount, 'course')}` : 'Not in any course'
                }
                onPress={() => router.push(routes.admin.section(s.id))}
                trailing={
                  <IconButton
                    icon="delete-outline"
                    label={`Delete ${s.title}`}
                    color="danger"
                    onPress={() => void confirmDeleteSection(s.id, s.title, s.courseCount)}
                  />
                }
              />
            ))}
        </Card>
      ) : (
        <Card padded={false}>
          {(lessons.data ?? [])
            .filter((l) => !needle || l.title.toLowerCase().includes(needle))
            .map((l) => (
              <ListRow
                key={l.id}
                title={l.title}
                subtitle={`${l.kind === 'video' ? 'Video' : 'PDF'} · ${l.sectionCount ? `in ${plural(l.sectionCount, 'unit')}` : 'not in any unit'}${l.attachedToVideoCount ? ` · notes for ${plural(l.attachedToVideoCount, 'video')}` : ''}`}
                leading={
                  <Icon
                    name={l.kind === 'video' ? 'youtube' : 'file-pdf-box'}
                    color={l.kind === 'video' ? 'danger' : 'primary'}
                  />
                }
                trailing={
                  <View style={styles.actions}>
                    <IconButton
                      icon="pencil"
                      label={`Rename ${l.title}`}
                      onPress={() => setRenaming(l)}
                    />
                    <IconButton
                      icon="delete-outline"
                      label={`Delete ${l.title}`}
                      color="danger"
                      onPress={() => void confirmDeleteLesson(l)}
                    />
                  </View>
                }
              />
            ))}
        </Card>
      )}
      <RenameLessonSheet lesson={renaming} onClose={() => setRenaming(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: spacing.sm },
  actions: { flexDirection: 'row' },
});
