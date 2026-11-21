import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { Banner } from '@/features/catalog';
import { routes } from '@/lib/routes';
import { radius, spacing, useLayout } from '@/ui';

/**
 * Swipeable banners at the top of Home. A banner linked to a course opens it. Each banner is as
 * wide as the page on a phone; on a wide screen two sit side by side.
 */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const { isWide } = useLayout();
  const [width, setWidth] = useState(0);
  const perView = isWide && banners.length > 1 ? 2 : 1;
  const itemWidth = width > 0 ? (width - spacing.md * (perView - 1)) / perView : 0;

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {itemWidth > 0 ? (
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // react-native-web gives ScrollView flexGrow: 1, which stretches a horizontal strip (and
  // its cards) to the screen's full height.
  strip: { flexGrow: 0 },
  row: { gap: spacing.md, alignItems: 'flex-start' },
  image: { aspectRatio: 16 / 9, borderRadius: radius.lg },
});
