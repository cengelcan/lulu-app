import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DashboardSectionHeader } from '@/components/dashboard/DashboardSectionHeader';
import { RecordHistoryRow } from '@/components/records/RecordHistoryRow';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { getLocaleTag } from '@/utils/locale';
import { getRecordFormRoute } from '@/utils/pet-record-display';
import { buildUpcomingReminders } from '@/utils/upcoming-reminders';
import type { PetRecord } from '@/types/pet-record';

type UpcomingRemindersSectionProps = {
  records: PetRecord[];
};

export function UpcomingRemindersSection({ records }: UpcomingRemindersSectionProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);

  const reminders = buildUpcomingReminders(records, locale, t);

  if (reminders.length === 0) {
    return null;
  }

  const handleSeeAll = () => {
    router.push('/records' as Href);
  };

  const handleReminderPress = (recordType: PetRecord['type'], recordId: string) => {
    router.push(getRecordFormRoute(recordType, recordId) as Href);
  };

  return (
    <View style={styles.section}>
      <DashboardSectionHeader
        title={t('dashboard.upcomingReminders')}
        icon="clock.fill"
        actionLabel={t('dashboard.seeAllReminders')}
        onActionPress={handleSeeAll}
      />
      <Card style={styles.card}>
        {reminders.map((reminder, index) => (
          <RecordHistoryRow
            key={reminder.key}
            title={reminder.title}
            subtitle={reminder.subtitle}
            dateLabel={reminder.dateLabel}
            icon={reminder.icon}
            backgroundColor={reminder.backgroundColor}
            isLast={index === reminders.length - 1}
            onPress={() => handleReminderPress(reminder.recordType, reminder.recordId)}
          />
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  card: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
});
