import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { radius, useTheme } from '../theme';
import { Icon, type IconName } from './icon';

export interface ThumbnailProps {
  uri: string | null;
  /** Width in points; height follows the 16:9 shape of YouTube thumbnails and course covers. */
  width?: number;
  fallbackIcon?: IconName;
  accessibilityLabel?: string;
  /** A small label in the corner, such as a video's length. */
  caption?: string | undefined;
}

export function Thumbnail({
  uri,
  width,
  fallbackIcon = 'image-outline',
  accessibilityLabel,
  caption,
}: ThumbnailProps) {
  const { colors } = useTheme();
  const box = [
    styles.box,
    width ? { width } : styles.fill,
    { backgroundColor: colors.surfaceMuted },
  ];

  return (
    <View style={box} accessibilityLabel={accessibilityLabel}>
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.centre]}>
          <Icon name={fallbackIcon} color="textFaint" size={width && width < 100 ? 20 : 32} />
        </View>
      )}
      {caption ? (
        <View style={styles.caption}>
          <Text style={styles.captionText}>{caption}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { aspectRatio: 16 / 9, borderRadius: radius.sm, overflow: 'hidden' },
  fill: { width: '100%' },
  centre: { alignItems: 'center', justifyContent: 'center' },
  // Always white on near-black: it sits on a picture, whatever the theme.
  caption: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(11, 14, 42, 0.82)',
  },
  captionText: { color: '#FFFFFF', fontSize: 11, lineHeight: 15, fontWeight: '600' },
});
