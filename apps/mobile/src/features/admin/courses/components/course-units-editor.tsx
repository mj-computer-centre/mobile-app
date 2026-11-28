import { moveItem, type Unit } from '@mcc/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { confirmAction } from '@/lib/platform/confirm';
import { routes } from '@/lib/routes';
import { AppText, Button, ListGroup, ListRow, spacing, TextField } from '@/ui';

import { useLibrarySections } from '../../sections/hooks';
import { ErrorNotice } from '../../shared/error-notice';
import { PickFromListModal } from '../../shared/pick-from-list-modal';
import { ReorderControls } from '../../shared/reorder-controls';
import { useCourseUnits } from '../hooks';

export function CourseUnitsEditor({ courseId, units }: { courseId: string; units: Unit[] }) {
  const { createUnit, attachUnit, detachUnit, reorderUnits } = useCourseUnits(courseId);
  const library = useLibrarySections();
  const [newTitle, setNewTitle] = useState('');
  const [picking, setPicking] = useState(false);
  const busy = reorderUnits.isPending || detachUnit.isPending;
  const error = createUnit.error ?? attachUnit.error ?? detachUnit.error ?? reorderUnits.error;

  const inCourse = new Set(units.map((unit) => unit.sectionId));
  const available = library.data
    ?.filter((section) => !inCourse.has(section.id))
    .map((section) => ({
      id: section.id,
      title: section.title,
      subtitle:
        section.courseCount > 0
          ? `Used in ${section.courseCount} course${section.courseCount === 1 ? '' : 's'}`
          : 'Not in any course yet',
    }));

  const remove = async (unit: Unit) => {
    const ok = await confirmAction({
      title: `Remove ${unit.title}?`,
      message:
        'It comes out of this course only. The unit and its lessons stay in the library and in other courses.',
      confirmLabel: 'Remove',
    });
    if (ok) detachUnit.mutate(unit.sectionId);
  };

  return (
    <View style={styles.root}>
      {units.length === 0 ? (
        <AppText color="textMuted">
          No units yet. Add the first one below, for example “Fundamentals of Computer”.
        </AppText>
      ) : (
        <ListGroup>
          {units.map((unit, index) => (
            <ListRow
              key={unit.sectionId}
              title={unit.label}
              subtitle={`${unit.lessons.length} lesson${unit.lessons.length === 1 ? '' : 's'}`}
              onPress={() => router.push(routes.admin.section(unit.sectionId, courseId))}
              accessibilityHint="Opens the unit to edit its lessons"
              trailing={
                <ReorderControls
                  itemLabel={unit.title}
                  index={index}
                  count={units.length}
                  disabled={busy}
                  onMove={(from, to) =>
                    reorderUnits.mutate(moveItem(units, from, to).map((item) => item.sectionId))
                  }
                  onRemove={() => void remove(unit)}
                  removeLabel="Remove from course"
                />
              }
            />
          ))}
        </ListGroup>
      )}

      <View style={styles.add}>
        <TextField
          label="New unit"
          placeholder="MS Word"
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <View style={styles.buttons}>
          <Button
            label="Add new unit"
            icon="plus"
            loading={createUnit.isPending}
            disabled={!newTitle.trim()}
            onPress={() =>
              createUnit.mutate(
                { title: newTitle, description: '' },
                { onSuccess: () => setNewTitle('') },
              )
            }
            style={styles.button}
          />
          <Button
            label="Add a unit from another course"
            icon="content-copy"
            variant="secondary"
            loading={attachUnit.isPending}
            onPress={() => setPicking(true)}
            style={styles.button}
          />
        </View>
        <ErrorNotice error={error} />
      </View>

      <PickFromListModal
        visible={picking}
        title="Add an existing unit"
        items={available}
        emptyMessage="Every unit is already in this course."
        onPick={(sectionId) => attachUnit.mutate(sectionId)}
        onClose={() => setPicking(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  add: { gap: spacing.md },
  // Side by side where there is room; one under the other on a phone.
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  button: { flexGrow: 1, flexBasis: 240 },
});
