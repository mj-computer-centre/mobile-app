import { useIsSignedIn } from '@/features/auth';
import { CoursesScreen } from '@/features/catalog';
import { SiteCoursesScreen } from '@/features/site';

export default function CoursesRoute() {
  return useIsSignedIn() ? <CoursesScreen /> : <SiteCoursesScreen />;
}
