import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { coverTints, Icon, radius } from '@/ui';

export interface CourseCoverProps {
  title: string;
  imageUrl: string | null;
  /** Rounded corners for a cover that stands alone; inside a card the card clips it. */
  rounded?: boolean;
}

/**
 * A course's 16:9 cover. Until the centre uploads a picture, the course gets a coloured panel
 * with its short name ("DCA", "BC"), so cards never look empty or broken.
 */
export function CourseCover({ title, imageUrl, rounded = false }: CourseCoverProps) {
  const shape = [styles.box, rounded && styles.rounded];
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={shape}
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
        accessibilityLabel={`${title} cover`}
      />
    );
  }
  return (
    <View
      style={[shape, styles.placeholder, { backgroundColor: tintFor(title) }]}
      accessibilityLabel={`${title} cover`}>
      <View style={styles.watermark} pointerEvents="none">
        <Icon name="laptop" size={120} color="onHero" />
      </View>
      <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
        {shortName(title)}
      </Text>
    </View>
  );
}

/** "DCA" stays "DCA"; "Basic Computer" becomes "BC". */
function shortName(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length <= 6 && !/\s/.test(trimmed)) return trimmed.toUpperCase();
  const words = trimmed.split(/\s+/).filter(Boolean);
  return (
    words
      .slice(0, 3)
      .map((word) => word[0] ?? '')
      .join('')
      .toUpperCase() || '•'
  );
}

function tintFor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  return coverTints[hash % coverTints.length] ?? coverTints[0] ?? '#1F5FAE';
}

const styles = StyleSheet.create({
  box: { width: '100%', aspectRatio: 16 / 9, overflow: 'hidden' },
  rounded: { borderRadius: radius.lg },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  watermark: { position: 'absolute', right: -18, bottom: -30, opacity: 0.12 },
  label: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: 1,
    paddingHorizontal: 16,
  },
});
