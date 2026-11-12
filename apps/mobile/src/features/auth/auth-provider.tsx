import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { DEV_USER_ID, devBypass } from '@/lib/dev-bypass';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  /** True until the stored session has been read on start-up. */
  isRestoring: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // Dev bypass: there is no session to restore and Supabase must not be called.
  const [state, setState] = useState<AuthState>({ session: null, isRestoring: !devBypass });

  useEffect(() => {
    if (devBypass) return;
    const db = supabase();
    let active = true;

    void db.auth.getSession().then(({ data }) => {
      if (active) setState({ session: data.session, isRestoring: false });
    });

    const { data } = db.auth.onAuthStateChange((event, session) => {
      // Never show one person's cached data to the next person on a shared phone.
      if (event === 'SIGNED_OUT') queryClient.clear();
      setState({ session, isRestoring: false });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [queryClient]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

/** The signed-in user's id. Only call from screens behind the sign-in gate. */
export function useUserId(): string {
  const { session } = useAuth();
  if (devBypass) return DEV_USER_ID;
  if (!session) throw new Error('useUserId called while signed out');
  return session.user.id;
}
