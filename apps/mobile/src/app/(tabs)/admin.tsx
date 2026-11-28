import { Redirect } from 'expo-router';

import { useStaffRole } from '@/features/auth';
import { AdminHomeScreen } from '@/features/admin';
import { routes } from '@/lib/routes';

export default function AdminRoute() {
  // The tab is hidden for everyone but staff; this covers a typed address. The database
  // refuses the data either way.
  return useStaffRole() ? <AdminHomeScreen /> : <Redirect href={routes.home} />;
}
