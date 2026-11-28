import { useIsSignedIn } from '@/features/auth';
import { HomeScreen } from '@/features/home';
import { LandingScreen } from '@/features/site';

/** The app's Home for someone signed in; the website's home page for a visitor. */
export default function HomeRoute() {
  return useIsSignedIn() ? <HomeScreen /> : <LandingScreen />;
}
