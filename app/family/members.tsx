import { Stack } from 'expo-router';

import { FamilyMembersContent } from '@/components/family/FamilyMembersContent';
import { useTranslation } from '@/hooks/use-translation';

export default function FamilyMembersScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('family.manage') }} />
      <FamilyMembersContent />
    </>
  );
}
