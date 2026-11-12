import { useState } from 'react';
import { FlatList, Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppText,
  Button,
  EmptyState,
  ListRow,
  LoadingState,
  spacing,
  TextField,
  useTheme,
} from '@/ui';

export interface PickableItem {
  id: string;
  title: string;
  subtitle?: string;
}

export interface PickFromListModalProps {
  visible: boolean;
  title: string;
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
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();
  const filtered = items?.filter(
    (item) =>
      !needle ||
      item.title.toLowerCase().includes(needle) ||
      item.subtitle?.toLowerCase().includes(needle),
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <AppText variant="heading" style={styles.title}>
            {title}
          </AppText>
          <Button label="Close" variant="ghost" compact onPress={onClose} />
        </View>
        <View style={styles.search}>
          <TextField label="Search" value={search} onChangeText={setSearch} autoCorrect={false} />
        </View>
        {!filtered ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState icon="magnify" title={needle ? 'Nothing matches' : emptyMessage} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
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
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  title: { flex: 1 },
  search: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
