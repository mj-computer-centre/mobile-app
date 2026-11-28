import { toAppError } from '@mcc/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { confirmAction, showMessage } from '@/lib/platform/confirm';
import { routes } from '@/lib/routes';
import {
  EmptyState,
  ErrorState,
  IconButton,
  IconChip,
  ListGroup,
  ListRow,
  Screen,
  SegmentedControl,
  SkeletonRows,
  TextField,
  type Segment,
} from '@/ui';

import type { LibraryLesson } from '../lessons/api';
import { useDeleteLesson, useLibraryLessons } from '../lessons/hooks';
import { useDeleteSection, useLibrarySections } from '../sections/hooks';
import { RenameLessonSheet } from './rename-lesson-sheet';

type Tab = 'units' | 'lessons';

const TABS: readonly Segment<Tab>[] = [
  { value: 'units', label: 'Units' },
  { value: 'lessons', label: 'Videos and PDFs' },
];

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

function lessonSubtitle(lesson: LibraryLesson): string {
  return [
    lesson.kind === 'video' ? 'Video' : 'PDF',
    lesson.sectionCount ? `in ${plural(lesson.sectionCount, 'unit')}` : 'not in any unit',
    lesson.attachedToVideoCount
      ? `notes for ${plural(lesson.attachedToVideoCount, 'video')}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

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
  const matches = (title: string) => !needle || title.toLowerCase().includes(needle);
  const units = (sections.data ?? []).filter((section) => matches(section.title));
  const items = (lessons.data ?? []).filter((lesson) => matches(lesson.title));

  return (
    <Screen edges={[]} refreshing={active.isRefetching} onRefresh={() => void active.refetch()}>
      <SegmentedControl
        accessibilityLabel="What to show"
        segments={TABS}
        value={tab}
        onChange={setTab}
      />
      <TextField label="Search" value={search} onChangeText={setSearch} autoCorrect={false} />

      {active.isPending ? (
        <SkeletonRows count={5} />
      ) : active.isError ? (
        <ErrorState error={active.error} onRetry={() => void active.refetch()} />
      ) : tab === 'units' ? (
        units.length === 0 ? (
          <EmptyState
            icon="view-list-outline"
            title={needle ? 'No unit matches' : 'No units yet'}
            message={
              needle ? undefined : 'Units are made inside a course: open a course and add one.'
            }
          />
        ) : (
          <ListGroup>
            {units.map((unit) => (
              <ListRow
                key={unit.id}
                title={unit.title}
                subtitle={
                  unit.courseCount
                    ? `In ${plural(unit.courseCount, 'course')}`
                    : 'Not in any course'
                }
                leading={<IconChip name="view-list-outline" tone="neutral" size={40} />}
                onPress={() => router.push(routes.admin.section(unit.id))}
                accessibilityHint="Opens the unit to edit its lessons"
                trailing={
                  <IconButton
                    icon="delete-outline"
                    label={`Delete ${unit.title}`}
                    color="danger"
                    onPress={() => void confirmDeleteSection(unit.id, unit.title, unit.courseCount)}
                  />
                }
              />
            ))}
          </ListGroup>
        )
      ) : items.length === 0 ? (
        <EmptyState
          icon="play-box-multiple-outline"
          title={needle ? 'Nothing matches' : 'No videos or PDFs yet'}
          message={needle ? undefined : 'They are added inside a unit: open a course, then a unit.'}
        />
      ) : (
        <ListGroup>
          {items.map((lesson) => (
            <ListRow
              key={lesson.id}
              title={lesson.title}
              subtitle={lessonSubtitle(lesson)}
              leading={
                <IconChip
                  name={lesson.kind === 'video' ? 'play-circle-outline' : 'file-document-outline'}
                  tone={lesson.kind === 'video' ? 'primary' : 'danger'}
                  size={40}
                />
              }
              trailing={
                <View style={styles.actions}>
                  <IconButton
                    icon="pencil"
                    label={`Rename ${lesson.title}`}
                    onPress={() => setRenaming(lesson)}
                  />
                  <IconButton
                    icon="delete-outline"
                    label={`Delete ${lesson.title}`}
                    color="danger"
                    onPress={() => void confirmDeleteLesson(lesson)}
                  />
                </View>
              }
            />
          ))}
        </ListGroup>
      )}
      <RenameLessonSheet lesson={renaming} onClose={() => setRenaming(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row' },
});
