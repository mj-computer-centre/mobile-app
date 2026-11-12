import { z } from 'zod';

import { devBypass } from './dev-bypass';

// The library's own hosted page; used until EXPO_PUBLIC_PLAYER_PAGE_URL points at ours.
const LIBRARY_PLAYER_PAGE =
  'https://lonelycpp.github.io/react-native-youtube-iframe/iframe_v2.html';

const schema = z.object({
  supabaseUrl: z.url({ protocol: /^https?$/ }),
  supabasePublishableKey: z.string().min(20),
  googleWebClientId: z.string().endsWith('.apps.googleusercontent.com'),
  playerPageUrl: z.url({ protocol: /^https$/ }),
});

export type Env = z.infer<typeof schema>;

export type EnvResult = { ok: true; env: Env } | { ok: false; problems: string[] };

// With the dev bypass nothing talks to Supabase or Google, so their settings may stay empty.
const BYPASS_DEFAULTS = devBypass
  ? {
      supabaseUrl: 'https://dev-bypass.invalid',
      supabasePublishableKey: 'dev-bypass-not-a-real-key',
      googleWebClientId: 'dev-bypass.apps.googleusercontent.com',
    }
  : null;

// EXPO_PUBLIC_* values are inlined at build time, so each must be read by its literal name.
function readEnv(): EnvResult {
  const result = schema.safeParse({
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || BYPASS_DEFAULTS?.supabaseUrl,
    supabasePublishableKey:
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || BYPASS_DEFAULTS?.supabasePublishableKey,
    googleWebClientId:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || BYPASS_DEFAULTS?.googleWebClientId,
    playerPageUrl: process.env.EXPO_PUBLIC_PLAYER_PAGE_URL || LIBRARY_PLAYER_PAGE,
  });
  if (result.success) return { ok: true, env: result.data };
  return {
    ok: false,
    problems: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
  };
}

export const envResult: EnvResult = readEnv();

/** The validated settings. The root layout shows a setup screen instead of the app when invalid. */
export function getEnv(): Env {
  if (!envResult.ok) {
    throw new Error(`App is not configured: ${envResult.problems.join('; ')}`);
  }
  return envResult.env;
}
