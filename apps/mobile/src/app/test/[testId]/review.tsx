import { useLocalSearchParams } from 'expo-router';

import { TestReviewScreen } from '@/features/tests';

export default function TestReviewRoute() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  return <TestReviewScreen testId={testId} />;
}
