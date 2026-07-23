import { Stack } from 'expo-router';

import { VetVisitBriefScreen } from '@/components/vet-visit/vet-visit-brief-screen';
import { useHubStackScreenOptions } from '@/hooks/use-hub-stack-screen-options';
import { useTranslation } from '@/hooks/use-translation';

export default function VetVisitScreen() {
  const { t } = useTranslation();
  const screenOptions = useHubStackScreenOptions(t('vetVisit.title'));

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <VetVisitBriefScreen />
    </>
  );
}
