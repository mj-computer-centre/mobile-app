import { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Divider, EmptyState, ListRow, Sheet, SkeletonRows, spacing, TextField } from '@/ui';

export interface PickableItem {
  id: string;
  title: string;
  subtitle?: string;
}

export interface PickFromListModalProps {
  visible: boolean;
  title: string;
  /** Undefined while the list is loading. */
  items: PickableItem[] | undefined;
  emptyMessage: string;
  onPick: (id: string) => void;
  onClose: () => void;
}

/** A searchable list in a sheet: "Add an existing unit", "Choose a notes PDF", and so on. */
export function PickFromListModal({
  visible,
  title,
  items,
  emptyMessage,
  onPick,
  onClose,
}: PickFromListModalProps) {
  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();
  const filtered = items?.filter(
    (item) =>
      !needle ||
      item.title.toLowerCase().includes(needle) ||
      item.subtitle?.toLowerCase().includes(needle),
  );

  return (
    <Sheet visible={visible} onClose={onClose} title={title} tall>
      <TextField label="Search" value={search} onChangeText={setSearch} autoCorrect={false} />
      {!filtered ? (
        <SkeletonRows count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="magnify" title={needle ? 'Nothing matches' : emptyMessage} />
      ) : (
        <FlatList
          style={styles.list}
          data={filtered}
          keyExtractor={(item) => item.id}
          // A tap on a row picks it even while the keyboard is up from searching.
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={Divider}
          renderItem={({ item }) => (
            <ListRow
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => {
                onPick(item.id);
                onClose();
              }}
            />
          )}
        />
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  // Rows carry their own side padding, so the list reaches the sheet's edges.
  list: { flex: 1, marginHorizontal: -spacing.lg },
});
