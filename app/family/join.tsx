import { Stack } from 'expo-router';

import { JoinFamilyContent } from '@/components/family/JoinFamilyContent';
import { useTranslation } from '@/hooks/use-translation';

export default function JoinFamilyInFamilyStackScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('sharing.joinFamily') }} />
      <JoinFamilyContent />
    </>
  );
}
