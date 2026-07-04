import { Stack } from 'expo-router';

import { FamilySharingScreenContent } from '@/components/sharing/FamilySharingScreenContent';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { useTranslation } from '@/hooks/use-translation';

export default function FamilySharingScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          ...STACK_BACK_ONLY_OPTIONS,
          headerShown: true,
          title: t('sharing.shareWithFamily'),
        }}
      />
      <FamilySharingScreenContent edges={['bottom']} />
    </>
  );
}
