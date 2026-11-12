import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import type { Banner } from '@/features/catalog';
import { routes } from '@/lib/routes';
import { MAX_CONTENT_WIDTH, radius, spacing } from '@/ui';

/** Swipeable banners at the top of Home. A banner linked to a course opens it. */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const { width } = useWindowDimensions();
  const itemWidth = Math.min(width, MAX_CONTENT_WIDTH) - spacing.lg * 2;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemWidth + spacing.md}
      decelerationRate="fast"
      style={styles.strip}
      contentContainerStyle={styles.row}>
      {banners.map((banner, index) => {
        const courseId = banner.courseId;
        return (
          <Pressable
            key={banner.id}
            accessibilityRole={courseId ? 'button' : 'image'}
            accessibilityLabel={
              courseId ? `Banner ${index + 1}, opens a course` : `Banner ${index + 1}`
            }
            disabled={!courseId}
            onPress={() => courseId && router.push(routes.course(courseId))}>
            <Image
              source={{ uri: banner.imageUrl }}
              style={[styles.image, { width: itemWidth }]}
              contentFit="cover"
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // react-native-web gives ScrollView flexGrow: 1, which stretches a horizontal strip (and
  // its cards) to the screen's full height.
  strip: { flexGrow: 0 },
  row: { gap: spacing.md, alignItems: 'flex-start' },
  image: { aspectRatio: 16 / 9, borderRadius: radius.lg },
});
