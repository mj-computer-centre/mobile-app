import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { MAX_CONTENT_WIDTH } from '@/ui';

import type { LessonPlayerProps } from './lesson-player';

/**
 * Web (admin website preview): a privacy-enhanced embed. Browsers do not let a page stop links
 * inside a cross-origin iframe, so the no-exit guarantee applies to the Android app only.
 */
export function LessonPlayer({ videoId }: LessonPlayerProps) {
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const height = Math.round((frameWidth * 9) / 16);
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1&playsinline=1`;

  return (
    <View style={[styles.frame, { height }]}>
      <iframe
        title="Lesson video"
        src={src}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
});
