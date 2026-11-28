import { router } from 'expo-router';

import { PageTitle } from '@/lib/page-title';
import { routes } from '@/lib/routes';
import { EmptyState } from '@/ui';

export default function NotFound() {
  return (
    <>
      <PageTitle title="Page not found" />
      <EmptyState
        icon="map-marker-question-outline"
        title="This page does not exist"
        message="The link may be old or mistyped."
        action={{ label: 'Go to the home page', onPress: () => router.replace(routes.home) }}
      />
    </>
  );
}
