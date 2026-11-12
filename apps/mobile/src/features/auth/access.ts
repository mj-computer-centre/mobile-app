import type { StaffRole } from '@mcc/shared';
import { useQuery } from '@tanstack/react-query';

import { runMaybe } from '@/lib/data';
import { DEV_USER_ID, devBypass, devBypassStaffRole } from '@/lib/dev-bypass';
import { supabase } from '@/lib/supabase';

import { useAuth } from './auth-provider';

export type Access =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'needs-profile'; userId: string }
  | { status: 'ready'; userId: string; role: StaffRole | null };

export const accessKeys = {
  all: ['access'] as const,
  forUser: (userId: string) => ['access', userId] as const,
};

interface AccessFacts {
  profileCompleted: boolean;
  role: StaffRole | null;
}

async function fetchAccessFacts(userId: string): Promise<AccessFacts> {
  const db = supabase();
  const [profile, staff] = await Promise.all([
    runMaybe(db.from('profiles').select('profile_completed_at').eq('id', userId).maybeSingle()),
    runMaybe(db.from('staff').select('role').eq('user_id', userId).maybeSingle()),
  ]);
  return {
    // Staff never need the student form; the owner signs in to manage content.
    profileCompleted: Boolean(profile?.profile_completed_at) || staff !== null,
    role: staff?.role ?? null,
  };
}

/** Where the signed-in person may go: the sign-in screen, the profile form, or the app. */
export function useAccess(): Access {
  const { session, isRestoring } = useAuth();
  const userId = session?.user.id;
  const facts = useQuery({
    queryKey: accessKeys.forUser(userId ?? 'none'),
    queryFn: () => fetchAccessFacts(userId as string),
    enabled: Boolean(userId) && !devBypass,
    staleTime: 5 * 60_000,
  });

  if (devBypass) return { status: 'ready', userId: DEV_USER_ID, role: devBypassStaffRole() };
  if (isRestoring) return { status: 'loading' };
  if (!userId) return { status: 'signed-out' };
  // Offline at start-up: let them into the app, where every screen shows a retryable error,
  // rather than trapping them on a form they may already have filled in.
  if (!facts.data)
    return facts.isError ? { status: 'ready', userId, role: null } : { status: 'loading' };
  if (!facts.data.profileCompleted) return { status: 'needs-profile', userId };
  return { status: 'ready', userId, role: facts.data.role };
}

/** The current person's staff role, or null for students. */
export function useStaffRole(): StaffRole | null {
  const access = useAccess();
  return access.status === 'ready' ? access.role : null;
}
