import type { ReactNode } from 'react';

import { Section, SitePage, useIsPublicSite } from '@/features/site';
import { Screen } from '@/ui';

/**
 * The frame of the two pages Google Play asks every app to publish (privacy policy, account
 * deletion). A visitor on the website sees them as pages of the public site, with its top bar
 * and footer; someone signed in, or using the phone app, sees them as ordinary screens.
 */
export function LegalPage({ children }: { children: ReactNode }) {
  const publicSite = useIsPublicSite();
  if (publicSite) {
    return (
      <SitePage>
        <Section width="narrow">{children}</Section>
      </SitePage>
    );
  }
  return <Screen edges={['bottom']}>{children}</Screen>;
}
