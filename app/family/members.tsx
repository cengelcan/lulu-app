import { Stack } from 'expo-router';

import { FamilyMembersContent } from '@/components/family/FamilyMembersContent';
import { FamilyOwnerRouteGuard } from '@/components/family/family-owner-route-guard';
import { useTranslation } from '@/hooks/use-translation';

export default function FamilyMembersScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('family.manage') }} />
      <FamilyOwnerRouteGuard>
        <FamilyMembersContent />
      </FamilyOwnerRouteGuard>
    </>
  );
}
