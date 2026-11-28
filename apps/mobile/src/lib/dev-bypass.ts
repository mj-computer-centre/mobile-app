import type { StaffRole } from '@mcc/shared';

/**
 * Development-only auth bypass (EXPO_PUBLIC_DEV_AUTH_BYPASS in .env.local).
 *
 * When on, the app skips Google sign-in and the profile form, acts as the chosen role, and runs
 * entirely on demo data (src/dev): Supabase is never called, so nothing is read from or saved to
 * a real project. The `visitor` role is the opposite of signing in: it shows what someone who
 * has not signed in sees (the public website), also on demo data. Three guards keep it out of
 * releases:
 *  1. it is read only when __DEV__ is true (development bundles);
 *  2. app.config.ts refuses to build a production bundle while the variable is set;
 *  3. a "DEV BYPASS" badge is always on screen while it is active.
 */
export type DevBypassRole = 'visitor' | 'student' | StaffRole;

/** A fixed id for the pretend user, so demo data can refer to them. */
export const DEV_USER_ID = '00000000-0000-4000-8000-0000000000d1';

function readRole(): DevBypassRole | null {
  const raw = process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS?.trim().toLowerCase();
  if (!raw || raw === 'off' || raw === 'false') return null;
  if (raw === 'visitor' || raw === 'student' || raw === 'admin' || raw === 'owner') return raw;
  console.warn(
    `EXPO_PUBLIC_DEV_AUTH_BYPASS="${raw}" is not visitor, student, admin or owner; ignoring it.`,
  );
  return null;
}

export const devBypass: { role: DevBypassRole } | null = (() => {
  if (!__DEV__) return null;
  const role = readRole();
  return role ? { role } : null;
})();

/** The staff role the bypass acts as, or null for a student or a visitor. */
export function devBypassStaffRole(): StaffRole | null {
  const role = devBypass?.role;
  return role === 'owner' || role === 'admin' ? role : null;
}
