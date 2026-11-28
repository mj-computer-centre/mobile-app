import { StyleSheet, View } from 'react-native';

import { MAX_CONTENT_WIDTH, useTheme } from '@/ui';

import type { LessonPlayerProps } from './lesson-player';

/**
 * Web: a privacy-enhanced embed that fills the width it is given at 16:9. Browsers do not let
 * a page stop links inside a cross-origin iframe, so the no-exit guarantee applies to the
 * Android app only.
 */
export function LessonPlayer({ videoId }: LessonPlayerProps) {
  const { colors } = useTheme();
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1&playsinline=1`;

  return (
    <View style={[styles.frame, { backgroundColor: colors.surfaceMuted }]}>
      <iframe
        title="Lesson video"
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0, position: 'absolute', inset: 0 }}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
  },
});
