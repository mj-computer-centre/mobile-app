import { isAllowedPlayerRequest } from '@mcc/shared';
import { useState, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';

import { getEnv } from '@/lib/env';
import { MAX_CONTENT_WIDTH, useTheme } from '@/ui';

import { useFullscreenOrientation } from './use-fullscreen-orientation';

export interface LessonPlayerProps {
  videoId: string;
  onEnded?: () => void;
  onError?: (reason: string) => void;
  /** Drawn over the player when the video ends, hiding YouTube's own end screen. */
  endOverlay?: ReactNode;
}

/**
 * Plays a YouTube video inside the app and never lets a tap leave it (docs/architecture/
 * video-playback.md). Three things make that hold:
 *  1. every navigation the WebView attempts goes through isAllowedPlayerRequest;
 *  2. new windows (target=_blank, window.open) are switched off, so they fall back into rule 1
 *     instead of opening the browser;
 *  3. the library's iOS handler that opens youtube.com links in the YouTube app is replaced.
 * The WebView keeps originWhitelist ['*'] (the library's value): a narrower list would hand
 * non-matching URLs to the phone, which is exactly the exit we are closing.
 */
export function LessonPlayer({ videoId, onEnded, onError, endOverlay }: LessonPlayerProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [ended, setEnded] = useState(false);
  const onFullScreenChange = useFullscreenOrientation();
  const { playerPageUrl } = getEnv();

  const height = Math.round((Math.min(width, MAX_CONTENT_WIDTH) * 9) / 16);

  const onShouldStartLoadWithRequest = (request: ShouldStartLoadRequest) =>
    isAllowedPlayerRequest({ url: request.url, isTopFrame: request.isTopFrame }, playerPageUrl);

  return (
    <View style={[styles.frame, { height, backgroundColor: colors.surfaceMuted }]}>
      <YoutubePlayer
        key={videoId}
        height={height}
        videoId={videoId}
        play
        baseUrlOverride={playerPageUrl}
        initialPlayerParams={{ rel: false, modestbranding: true, iv_load_policy: 3 }}
        onChangeState={(state: string) => {
          if (state === 'ended') {
            setEnded(true);
            onEnded?.();
          } else if (state === 'playing') {
            setEnded(false);
          }
        }}
        onError={(reason: string) => onError?.(reason)}
        onFullScreenChange={onFullScreenChange}
        webViewProps={{
          onShouldStartLoadWithRequest,
          setSupportMultipleWindows: false,
          onOpenWindow: () => undefined,
          allowsLinkPreview: false,
        }}
      />
      {ended && endOverlay ? (
        <View
          style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: colors.surface }]}>
          {endOverlay}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', overflow: 'hidden' },
  overlay: { alignItems: 'center', justifyContent: 'center', padding: 16 },
});
