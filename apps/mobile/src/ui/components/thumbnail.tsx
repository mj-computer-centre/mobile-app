import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { radius, useTheme } from '../theme';
import { Icon, type IconName } from './icon';

export interface ThumbnailProps {
  uri: string | null;
  /** Width in points; height follows the 16:9 shape of YouTube thumbnails and course covers. */
  width?: number;
  fallbackIcon?: IconName;
  accessibilityLabel?: string;
}

export function Thumbnail({
  uri,
  width,
  fallbackIcon = 'image-outline',
  accessibilityLabel,
}: ThumbnailProps) {
  const { colors } = useTheme();
  const box = [
    styles.box,
    width ? { width } : styles.fill,
    { backgroundColor: colors.surfaceMuted },
  ];
  if (!uri) {
    return (
      <View style={[box, styles.centre]} accessibilityLabel={accessibilityLabel}>
        <Icon name={fallbackIcon} color="textMuted" size={width && width < 100 ? 20 : 32} />
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={box}
      contentFit="cover"
      transition={150}
      cachePolicy="memory-disk"
      accessibilityLabel={accessibilityLabel}
    />
  );
}

const styles = StyleSheet.create({
  box: { aspectRatio: 16 / 9, borderRadius: radius.md, overflow: 'hidden' },
  fill: { width: '100%' },
  centre: { alignItems: 'center', justifyContent: 'center' },
});
