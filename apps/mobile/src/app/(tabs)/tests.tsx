import { useIsSignedIn } from '@/features/auth';
import { SiteTestsScreen } from '@/features/site';
import { TestsScreen } from '@/features/tests';

export default function TestsRoute() {
  return useIsSignedIn() ? <TestsScreen /> : <SiteTestsScreen />;
}
