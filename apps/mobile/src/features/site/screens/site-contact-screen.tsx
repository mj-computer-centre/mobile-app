import { View } from 'react-native';

import { ContactDetails, useSettings } from '@/features/contact';
import { PageTitle } from '@/lib/page-title';
import { AppText, ErrorState, SkeletonRows, spacing } from '@/ui';

import { Section, SiteBody } from '../components/site-page';

/** The Contact page of the public website. */
export function SiteContactScreen() {
  const settings = useSettings();

  return (
    <SiteBody>
      <PageTitle
        title="Contact"
        description="Address, timings, phone and WhatsApp of Mishra Computer Centre, Makhdumpur, Jehanabad."
      />
      <Section width="narrow">
        {settings.isPending ? (
          <SkeletonRows count={4} />
        ) : settings.isError ? (
          <ErrorState error={settings.error} onRetry={() => void settings.refetch()} />
        ) : (
          <>
            <View style={{ gap: spacing.xs }}>
              <AppText variant="display" accessibilityRole="header">
                {settings.data.centre_name}
              </AppText>
              <AppText color="textMuted">Visit, call or message the centre.</AppText>
            </View>
            <ContactDetails settings={settings.data} />
          </>
        )}
      </Section>
    </SiteBody>
  );
}
