import { Stack } from 'expo-router';

import { JoinFamilyScreenContent } from '@/components/sharing/JoinFamilyScreenContent';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { useTranslation } from '@/hooks/use-translation';

export default function JoinFamilyScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          ...STACK_BACK_ONLY_OPTIONS,
          headerShown: true,
          title: t('sharing.joinFamily'),
        }}
      />
      <JoinFamilyScreenContent edges={['bottom']} />
    </>
  );
}
