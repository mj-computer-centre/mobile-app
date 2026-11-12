import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { seedDemoCache } from '@/dev/seed-demo-cache';
import { AuthProvider } from '@/features/auth';
import { devBypass } from '@/lib/dev-bypass';
import { createQueryClient } from '@/lib/query-client';
import { persistOptions } from '@/lib/query-persister';
import { useTheme } from '@/ui';

import { DevBypassBadge } from './dev-bypass-badge';

function createAppQueryClient() {
  const client = createQueryClient();
  if (devBypass) seedDemoCache(client, devBypass.role);
  return client;
}

/** Everything the app needs around its screens, in dependency order. */
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createAppQueryClient);
  const theme = useTheme();
  const navigationTheme = theme.dark ? DarkTheme : DefaultTheme;

  const tree = (
    <AuthProvider>
      <ThemeProvider
        value={{
          ...navigationTheme,
          colors: {
            ...navigationTheme.colors,
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.border,
          },
        }}>
        {children}
        {devBypass ? <DevBypassBadge role={devBypass.role} /> : null}
      </ThemeProvider>
    </AuthProvider>
  );

  return (
    <SafeAreaProvider>
      {persistOptions ? (
        <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
          {tree}
        </PersistQueryClientProvider>
      ) : (
        <QueryClientProvider client={queryClient}>{tree}</QueryClientProvider>
      )}
    </SafeAreaProvider>
  );
}
