import { MIN_COVER_TITLE_LENGTH } from '@mcc/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CourseCover } from '@/features/catalog';
import { pickImage, type PickedFile } from '@/lib/platform/picked-file';
import { AppText, Button, Notice, spacing, useLayout } from '@/ui';

import { AiCoverSheet } from './ai-cover-sheet';

export interface CoverPickerProps {
  /** The course's name and description, as saved or as typed so far. */
  title: string;
  description: string;
  /** The picture to show: the saved cover, or one chosen and not stored yet. Null for none. */
  imageUri: string | null;
  /** A picture is being stored or removed: the buttons wait. */
  busy?: boolean;
  /** Called with a picture the admin uploaded or one drawn by AI. */
  onPick: (picture: PickedFile) => void;
  /** Takes the picture away. Leave out when there is none to take. */
  onRemove?: (() => void) | undefined;
}

/**
 * A course's cover as students will see it, with the two ways to give it a picture: upload one,
 * or have four drawn by AI and choose. Used when creating a course and when editing one; what
 * happens to the picture is up to the screen.
 */
export function CoverPicker({
  title,
  description,
  imageUri,
  busy = false,
  onPick,
  onRemove,
}: CoverPickerProps) {
  const { isWide } = useLayout();
  const [drawing, setDrawing] = useState(false);
  const named = title.trim().length >= MIN_COVER_TITLE_LENGTH;

  const upload = async () => {
    const file = await pickImage();
    if (file) onPick(file);
  };

  return (
    <View style={isWide ? styles.sideBySide : styles.stacked}>
      <View style={isWide ? styles.coverWide : undefined}>
        <CourseCover title={title} imageUrl={imageUri} rounded />
      </View>
      <View style={[styles.actions, isWide && styles.grow]}>
        {imageUri ? null : (
          <Notice tone="neutral">
            No picture yet. Until you add one, students see this coloured panel with the course’s
            short name.
          </Notice>
        )}
        <Button
          label="Upload a picture"
          icon="image-plus"
          variant="secondary"
          disabled={busy}
          onPress={() => void upload()}
        />
        <Button
          label="Make one with AI"
          icon="creation"
          variant="secondary"
          disabled={busy || !named}
          onPress={() => setDrawing(true)}
        />
        {busy ? (
          <AppText variant="caption" color="textMuted" accessibilityLiveRegion="polite">
            Saving…
          </AppText>
        ) : !named ? (
          <AppText variant="caption" color="textMuted">
            To make one with AI, type the course name first.
          </AppText>
        ) : null}
        {onRemove ? (
          <Button
            label="Remove picture"
            icon="close"
            variant="ghost"
            compact
            disabled={busy}
            onPress={onRemove}
            style={styles.remove}
          />
        ) : null}
      </View>
      <AiCoverSheet
        visible={drawing}
        onClose={() => setDrawing(false)}
        title={title.trim()}
        description={description.trim()}
        onChoose={onPick}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stacked: { gap: spacing.md },
  sideBySide: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  coverWide: { width: 320 },
  actions: { gap: spacing.md },
  grow: { flex: 1 },
  remove: { alignSelf: 'flex-start' },
});
