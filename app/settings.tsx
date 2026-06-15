import { Stack } from 'expo-router';

import { SettingsScreenContent } from '@/components/settings/SettingsScreenContent';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { useTranslation } from '@/hooks/use-translation';

export default function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          ...STACK_BACK_ONLY_OPTIONS,
          headerShown: true,
          title: t('settings.title'),
        }}
      />
      <SettingsScreenContent edges={['bottom']} />
    </>
  );
}
