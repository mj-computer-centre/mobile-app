import { useMutation } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

import { signInWithGoogle, signOutOfGoogle } from './google-sign-in';

export function useSignIn() {
  return useMutation({ mutationFn: signInWithGoogle });
}

export async function signOut(): Promise<void> {
  await signOutOfGoogle();
  await supabase().auth.signOut();
}

export function useSignOut() {
  return useMutation({ mutationFn: signOut });
}
