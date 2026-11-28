import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { AppProviders } from '@/app-shell/app-providers';
import { useAppFonts } from '@/app-shell/fonts';
import { useHeaderOptions } from '@/app-shell/header-options';
import { SetupRequiredScreen } from '@/app-shell/setup-required-screen';
import { SplashView } from '@/app-shell/splash-view';
import { useAccess } from '@/features/auth';
import { envResult } from '@/lib/env';
import { routes } from '@/lib/routes';
import { useTheme } from '@/ui';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsReady = useAppFonts();
  if (!envResult.ok) {
    void SplashScreen.hideAsync();
    return <SetupRequiredScreen problems={envResult.problems} />;
  }
  return (
    <AppProviders>
      <RootNavigator fontsReady={fontsReady} />
      <StatusBar style="auto" />
    </AppProviders>
  );
}

/**
 * The access gate. Protected groups decide which screens exist for the current person, and each
 * group names where to go when it closes (Expo Router would otherwise fall back to the
 * navigator's anchor). The database enforces the same rules with row-level security.
 *
 * The website is public: someone who has not signed in can read the home page, the course list,
 * course outlines and the contact page there (the `anon` policies and `public_*` functions give
 * them exactly that much). The phone app starts at sign-in. Lessons, notes and tests always
 * need sign-in.
 */
function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const access = useAccess();
  const header = useHeaderOptions();
  const { colors } = useTheme();
  const isWeb = Platform.OS === 'web';
  // A phone holds its splash screen until the fonts are in, so text never jumps. The website
  // does not wait for them: its fonts swap in.
  const waiting = access.status === 'loading' || (!fontsReady && !isWeb);

  useEffect(() => {
    if (!waiting) void SplashScreen.hideAsync();
  }, [waiting]);

  if (waiting) return isWeb ? <SplashView /> : null; // the native splash screen stays up

  const signedOut = access.status === 'signed-out';
  const ready = access.status === 'ready';
  const isStaff = ready && access.role !== null;
  const publicSite = signedOut && isWeb;
  // Where each state belongs; used as the redirect when the person opens a screen of another state.
  const home = signedOut
    ? publicSite
      ? routes.home
      : routes.signIn
    : access.status === 'needs-profile'
      ? routes.completeProfile
      : routes.home;
  // A visitor who opens a lesson or a test is asked to sign in, not sent back to the home page.
  const signInFirst = signedOut ? routes.signIn : home;

  return (
    <Stack screenOptions={{ ...header, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={signedOut} redirectTo={home}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={access.status === 'needs-profile'} redirectTo={home}>
        <Stack.Screen
          name="complete-profile"
          options={{ title: 'About you', headerBackVisible: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={ready || publicSite} redirectTo={home}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="course/[courseId]" options={{ title: 'Course', headerShown: ready }} />
      </Stack.Protected>

      <Stack.Protected guard={ready} redirectTo={signInFirst}>
        <Stack.Screen name="lesson/[lessonId]" options={{ title: 'Lesson' }} />
        <Stack.Screen name="notes/[lessonId]" options={{ title: 'Notes' }} />
        <Stack.Screen name="test/[testId]/index" options={{ title: 'Test' }} />
        {/* No back gesture or header button out of a running test: leaving is a choice made on the screen. */}
        <Stack.Screen
          name="test/[testId]/take"
          options={{ title: 'Test', headerBackVisible: false, gestureEnabled: false }}
        />
        <Stack.Screen name="test/[testId]/review" options={{ title: 'Answers' }} />
        <Stack.Protected guard={isStaff} redirectTo={routes.home}>
          <Stack.Screen name="manage" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack.Protected>

      <Stack.Screen
        name="privacy"
        options={{ title: 'Privacy policy', headerShown: !publicSite }}
      />
      <Stack.Screen
        name="delete-account"
        options={{ title: 'Delete your account', headerShown: !publicSite }}
      />
      <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
    </Stack>
  );
}
