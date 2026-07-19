import { Stack } from 'expo-router';

import { FamilySettingsContent } from '@/components/family/FamilySettingsContent';
import { FamilyOwnerRouteGuard } from '@/components/family/family-owner-route-guard';
import { useTranslation } from '@/hooks/use-translation';

export default function FamilySettingsScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('family.settings') }} />
      <FamilyOwnerRouteGuard>
        <FamilySettingsContent />
      </FamilyOwnerRouteGuard>
    </>
  );
}
