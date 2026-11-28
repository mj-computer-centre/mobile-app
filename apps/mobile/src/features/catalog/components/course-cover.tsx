import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { coverTints, fonts, radius } from '@/ui';

export interface CourseCoverProps {
  title: string;
  imageUrl: string | null;
  /** Rounded corners for a cover that stands alone; inside a card the card clips it. */
  rounded?: boolean;
}

/** "DCA" stays "DCA"; "Basic Computer" becomes "BC". Also the legend on a course's key. */
export function courseShortName(title: string): string {
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

/** A course's own colour, from its title, so it is the same everywhere the course appears. */
export function courseTint(title: string): { face: string; edge: string } {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  return coverTints[hash % coverTints.length] ?? { face: '#2F45E3', edge: '#2337B8' };
}

const PATTERN_ROWS = [0, 1, 2];
const PATTERN_KEYS = [0, 1, 2, 3, 4, 5];

/**
 * A course's 16:9 cover. Until the centre uploads a picture, the course gets a panel in its own
 * colour with its short name set where a key carries its legend (top left) over a corner of a
 * keyboard, so cards never look empty or broken.
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
      style={[shape, { backgroundColor: courseTint(title).face }]}
      accessibilityLabel={`${title} cover`}>
      <View style={styles.pattern} pointerEvents="none">
        {PATTERN_ROWS.map((row) => (
          <View key={row} style={[styles.patternRow, { marginLeft: row * 14 }]}>
            {PATTERN_KEYS.map((key) => (
              <View key={key} style={styles.patternKey} />
            ))}
          </View>
        ))}
      </View>
      <Text style={styles.legend} numberOfLines={1} adjustsFontSizeToFit>
        {courseShortName(title)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: '100%', aspectRatio: 16 / 9, overflow: 'hidden' },
  rounded: { borderRadius: radius.lg },
  // White at low opacity works on every tint; these are not theme colours.
  pattern: { position: 'absolute', right: -34, bottom: -22, gap: 6 },
  patternRow: { flexDirection: 'row', gap: 6 },
  patternKey: {
    width: 38,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(11, 14, 42, 0.16)',
  },
  legend: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    color: '#FFFFFF',
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    includeFontPadding: false,
  },
});
