import { useLocalSearchParams } from 'expo-router';

import { SectionEditorScreen } from '@/features/admin';

export default function SectionEditorRoute() {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  return <SectionEditorScreen sectionId={sectionId} />;
}
