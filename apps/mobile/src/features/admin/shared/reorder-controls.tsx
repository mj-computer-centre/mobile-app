import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/ui';

export interface ReorderControlsProps {
  /** What is being moved, for screen readers ("Move MS Word up"). */
  itemLabel: string;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove?: () => void;
  removeLabel?: string;
  disabled?: boolean;
}

/**
 * Up / down / remove buttons. Arrows instead of drag-and-drop: they work the same on phones and
 * on the web admin, and are easy for screen-reader users.
 */
export function ReorderControls({
  itemLabel,
  index,
  count,
  onMove,
  onRemove,
  removeLabel = 'Remove',
  disabled,
}: ReorderControlsProps) {
  return (
    <View style={styles.row}>
      <IconButton
        icon="arrow-up"
        label={`Move ${itemLabel} up`}
        disabled={disabled || index === 0}
        onPress={() => onMove(index, index - 1)}
      />
      <IconButton
        icon="arrow-down"
        label={`Move ${itemLabel} down`}
        disabled={disabled || index === count - 1}
        onPress={() => onMove(index, index + 1)}
      />
      {onRemove ? (
        <IconButton
          icon="close"
          label={`${removeLabel} ${itemLabel}`}
          color="danger"
          disabled={disabled}
          onPress={onRemove}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
