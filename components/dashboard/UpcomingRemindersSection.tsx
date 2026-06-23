import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DashboardSectionHeader } from '@/components/dashboard/DashboardSectionHeader';
import { RecordHistoryRow } from '@/components/records/RecordHistoryRow';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { getLocaleTag } from '@/utils/locale';
import { getReminderFormRoute } from '@/utils/pet-reminder-display';
import { buildUpcomingReminders } from '@/utils/upcoming-reminders';
import type { PetReminder } from '@/types/pet-reminder';

type UpcomingRemindersSectionProps = {
  reminders: PetReminder[];
};

export function UpcomingRemindersSection({ reminders }: UpcomingRemindersSectionProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);

  const upcoming = buildUpcomingReminders(reminders, locale, t, {
    limit: 3,
    withinDays: 7,
  });

  if (upcoming.length === 0) {
    return null;
  }

  const handleSeeAll = () => {
    router.push('/reminders' as Href);
  };

  const handleReminderPress = (reminderType: PetReminder['type'], reminderId: string) => {
    router.push(getReminderFormRoute(reminderType, reminderId) as Href);
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
        {upcoming.map((reminder, index) => (
          <RecordHistoryRow
            key={reminder.key}
            title={reminder.title}
            subtitle={reminder.typeLabel}
            dateLabel={reminder.dateLabel}
            icon={reminder.icon}
            backgroundColor={reminder.backgroundColor}
            isLast={index === upcoming.length - 1}
            onPress={() => handleReminderPress(reminder.reminderType, reminder.reminderId)}
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
