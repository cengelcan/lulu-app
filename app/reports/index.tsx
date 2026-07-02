import { Stack } from 'expo-router';

import { ReportsWizardContent } from '@/components/reports/ReportsWizardContent';
import { useHubStackScreenOptions } from '@/hooks/use-hub-stack-screen-options';
import { useTranslation } from '@/hooks/use-translation';

export default function ReportsScreen() {
  const { t } = useTranslation();
  const screenOptions = useHubStackScreenOptions(t('reports.title'));

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <ReportsWizardContent />
    </>
  );
}
