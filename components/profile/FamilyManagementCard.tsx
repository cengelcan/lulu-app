import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ProfileListRow } from '@/components/profile/ProfileListRow';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/hooks/use-translation';

export function FamilyManagementCard() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Card style={styles.card}>
      <ProfileListRow
        label={t('care.familyManagement')}
        accessibilityHint={t('care.familyManagementHint')}
        icon="person.2.fill"
        isLast
        onPress={() => router.push('/(tabs)/family')}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
});
