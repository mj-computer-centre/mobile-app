import 'react-native-url-polyfill/auto';

import { AppError, type Database } from '@mcc/shared';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { getEnv } from './env';
import { authStorage } from './auth-storage';
import { devBypass } from './dev-bypass';

export type Db = SupabaseClient<Database>;

let client: Db | null = null;

/**
 * The single Supabase client. Created on first use so a missing configuration shows the setup
 * screen instead of crashing at import time.
 */
export function supabase(): Db {
  // The one choke point for the dev bypass: every read, write, upload and function call goes
  // through here, so demo mode can never touch a real project.
  if (devBypass) throw new AppError('demo_mode');
  if (client) return client;
  const env = getEnv();
  client = createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      // The web admin signs in with Google's redirect flow and reads the session from the URL.
      detectSessionInUrl: Platform.OS === 'web',
      flowType: 'pkce',
    },
  });

  // Refresh tokens only while the app is in the foreground (Supabase's React Native guidance).
  if (Platform.OS !== 'web') {
    const db = client;
    AppState.addEventListener('change', (state) => {
      if (state === 'active') void db.auth.startAutoRefresh();
      else void db.auth.stopAutoRefresh();
    });
  }
  return client;
}
