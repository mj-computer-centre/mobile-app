import { Redirect } from 'expo-router';

import { useIsSignedIn } from '@/features/auth';
import { ProfileScreen } from '@/features/profile';
import { routes } from '@/lib/routes';

export default function ProfileRoute() {
  // A visitor on the website has no profile; the tab is hidden for them, and a typed address
  // lands on sign-in.
  return useIsSignedIn() ? <ProfileScreen /> : <Redirect href={routes.signIn} />;
}
