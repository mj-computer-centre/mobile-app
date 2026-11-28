import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, shadows, spacing, useLayout, useTheme } from '../theme';
import { AppText } from './app-text';
import { Button } from './button';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string | undefined;
  children: ReactNode;
  /** Fills most of the screen, for sheets that hold a list. */
  tall?: boolean;
  /** Label of the button that closes the sheet without doing anything. */
  closeLabel?: string;
}

/**
 * A panel over the page for one small job: choosing from a list, renaming, picking a date. It
 * rises from the bottom on a phone and sits in the middle of a wide screen. Tapping outside,
 * the Close button and Android's back button all dismiss it.
 */
export function Sheet({
  visible,
  onClose,
  title,
  description,
  children,
  tall = false,
  closeLabel = 'Close',
}: SheetProps) {
  const { colors, dark } = useTheme();
  const { isWide } = useLayout();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType={isWide ? 'fade' : 'slide'}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.root, isWide ? styles.rootWide : styles.rootPhone]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.panel,
            isWide ? styles.panelWide : styles.panelPhone,
            tall && (isWide ? styles.tallWide : styles.tallPhone),
            { backgroundColor: colors.background, paddingBottom: insets.bottom + spacing.lg },
            !dark && shadows.raised,
          ]}>
          {isWide ? null : <View style={[styles.handle, { backgroundColor: colors.border }]} />}
          <View style={styles.header}>
            <View style={styles.titles}>
              <AppText variant="heading" accessibilityRole="header">
                {title}
              </AppText>
              {description ? (
                <AppText variant="caption" color="textMuted">
                  {description}
                </AppText>
              ) : null}
            </View>
            <Button label={closeLabel} variant="ghost" compact onPress={onClose} />
          </View>
          <View style={[styles.body, tall && styles.grow]}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  rootPhone: { justifyContent: 'flex-end' },
  rootWide: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  panel: { paddingTop: spacing.sm, maxHeight: '92%' },
  panelPhone: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  panelWide: { width: '100%', maxWidth: 520, borderRadius: radius.xl, paddingTop: spacing.md },
  tallPhone: { height: '88%' },
  tallWide: { height: '80%' },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
  },
  titles: { flex: 1, gap: 2 },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.md },
  grow: { flex: 1 },
});
