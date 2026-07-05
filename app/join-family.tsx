import { HeaderBackButton } from '@react-navigation/elements';
import { Stack, useRouter } from 'expo-router';

import { JoinFamilyContent } from '@/components/family/JoinFamilyContent';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

export default function JoinFamilyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <>
      <Stack.Screen
        options={{
          ...STACK_BACK_ONLY_OPTIONS,
          headerShown: true,
          title: t('sharing.joinFamily'),
          headerLeft: () => (
            <HeaderBackButton tintColor={primaryColor} onPress={() => router.back()} />
          ),
        }}
      />
      <JoinFamilyContent showOwnerFallback />
    </>
  );
}
