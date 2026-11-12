// Web (admin website): Supabase's Google redirect flow. The page navigates to Google and comes
// back signed in; the client reads the session from the URL (detectSessionInUrl).
import { supabase } from '@/lib/supabase';

export async function signInWithGoogle(): Promise<boolean> {
  const { error } = await supabase().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
  return true;
}

export async function signOutOfGoogle(): Promise<void> {
  // Nothing to forget on the web; signing out of Supabase is enough.
}
