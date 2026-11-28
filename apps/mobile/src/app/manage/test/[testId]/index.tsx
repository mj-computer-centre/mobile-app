import { useLocalSearchParams } from 'expo-router';

import { TestEditorScreen } from '@/features/admin';

export default function TestEditorRoute() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  return <TestEditorScreen testId={testId} />;
}
