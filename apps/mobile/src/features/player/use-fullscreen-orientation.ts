import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';

/**
 * The app is portrait-only, but a full-screen video should turn sideways. Unlocks rotation while
 * the player is full screen and locks back to portrait afterwards (and when the screen closes).
 */
export function useFullscreenOrientation(): (isFullScreen: boolean) => void {
  useEffect(() => {
    return () => {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  return (isFullScreen: boolean) => {
    if (isFullScreen) {
      void ScreenOrientation.unlockAsync();
    } else {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  };
}
