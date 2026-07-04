import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';

import { SettingsValueRow } from '@/components/settings/SettingsValueRow';
import { GroupedSection } from '@/components/pet/GroupedSection';
import { useFamilyPlusAccess } from '@/hooks/use-family-plus';
import { useTranslation } from '@/hooks/use-translation';

export function FamilySharingSettingsSection() {
  const router = useRouter();
  const { t } = useTranslation();
  const { canUseFamilySharing } = useFamilyPlusAccess();

  return (
    <GroupedSection title={t('sharing.settingsSection')}>
      <SettingsValueRow
        label={t('sharing.shareWithFamily')}
        value={canUseFamilySharing ? t('sharing.manage') : t('sharing.plusBadge')}
        onPress={() => router.push('/family-sharing' as Href)}
      />
      <SettingsValueRow
        label={t('sharing.joinFamily')}
        value={t('sharing.enterCode')}
        onPress={() => router.push('/join-family' as Href)}
        isLast
      />
    </GroupedSection>
  );
}
