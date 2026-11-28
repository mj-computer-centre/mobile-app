import { useIsSignedIn } from '@/features/auth';
import { ContactScreen } from '@/features/contact';
import { SiteContactScreen } from '@/features/site';

export default function ContactRoute() {
  return useIsSignedIn() ? <ContactScreen /> : <SiteContactScreen />;
}
