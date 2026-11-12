// Native Google sign-in: Google's own account picker returns an ID token, which Supabase turns
// into a session (Supabase docs: "Sign in with Google" for React Native).
import { AppError } from '@mcc/shared';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { getEnv } from '@/lib/env';
import { supabase } from '@/lib/supabase';

let configured = false;

function configure(): void {
  if (configured) return;
  GoogleSignin.configure({ webClientId: getEnv().googleWebClientId });
  configured = true;
}

/** Resolves true when signed in, false when the person closed the picker. */
export async function signInWithGoogle(): Promise<boolean> {
  configure();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return false;
    const idToken = response.data.idToken;
    if (!idToken) throw new AppError('unknown');
    const { error } = await supabase().auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) throw error;
    return true;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.IN_PROGRESS) return false;
    throw error;
  }
}

/** Forget the Google account too, so the next sign-in shows the account picker. */
export async function signOutOfGoogle(): Promise<void> {
  configure();
  await GoogleSignin.signOut().catch(() => undefined);
}
