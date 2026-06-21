import { Stack } from 'expo-router';

import { ReportsWizardContent } from '@/components/reports/ReportsWizardContent';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { useTranslation } from '@/hooks/use-translation';

export default function ReportsScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          ...STACK_BACK_ONLY_OPTIONS,
          headerShown: true,
          title: t('reports.title'),
        }}
      />
      <ReportsWizardContent />
    </>
  );
}
