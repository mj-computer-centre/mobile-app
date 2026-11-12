import { router } from 'expo-router';

import { routes } from '@/lib/routes';
import { EmptyState } from '@/ui';

export default function NotFound() {
  return (
    <EmptyState
      icon="map-marker-question-outline"
      title="This page does not exist"
      action={{ label: 'Go home', onPress: () => router.replace(routes.home) }}
    />
  );
}
