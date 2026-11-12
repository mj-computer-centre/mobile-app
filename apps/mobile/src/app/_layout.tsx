import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProviders } from '@/app-shell/app-providers';
import { SetupRequiredScreen } from '@/app-shell/setup-required-screen';
import { useAccess } from '@/features/auth';
import { envResult } from '@/lib/env';
import { routes } from '@/lib/routes';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  if (!envResult.ok) {
    void SplashScreen.hideAsync();
    return <SetupRequiredScreen problems={envResult.problems} />;
  }
  return (
    <AppProviders>
      <RootNavigator />
      <StatusBar style="auto" />
    </AppProviders>
  );
}

/**
 * The access gate. Protected groups decide which screens exist for the current person, and each
 * group names where to go when it closes (Expo Router would otherwise fall back to the
 * navigator's anchor, which can be a public page). The database enforces the same rules with
 * row-level security.
 */
function RootNavigator() {
  const access = useAccess();
  const loading = access.status === 'loading';

  useEffect(() => {
    if (!loading) void SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null; // the splash screen stays up

  const ready = access.status === 'ready';
  const isStaff = ready && access.role !== null;
  // Where each state belongs; used as the redirect when the person opens a screen of another state.
  const home =
    access.status === 'signed-out'
      ? routes.signIn
      : access.status === 'needs-profile'
        ? routes.completeProfile
        : routes.home;

  return (
    <Stack>
      <Stack.Protected guard={access.status === 'signed-out'} redirectTo={home}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={access.status === 'needs-profile'} redirectTo={home}>
        <Stack.Screen
          name="complete-profile"
          options={{ title: 'About you', headerBackVisible: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={ready} redirectTo={home}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="course/[courseId]" options={{ title: 'Course' }} />
        <Stack.Screen name="lesson/[lessonId]" options={{ title: 'Lesson' }} />
        <Stack.Screen name="notes/[lessonId]" options={{ title: 'Notes' }} />
        <Stack.Protected guard={isStaff} redirectTo={routes.home}>
          <Stack.Screen name="manage" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack.Protected>

      <Stack.Screen name="privacy" options={{ title: 'Privacy policy' }} />
      <Stack.Screen name="delete-account" options={{ title: 'Delete your account' }} />
      <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
    </Stack>
  );
}
