import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DashboardSectionHeader } from '@/components/dashboard/DashboardSectionHeader';
import { ReminderListRow } from '@/components/reminders/ReminderListRow';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { getLocaleTag } from '@/utils/locale';
import { getReminderFormRoute } from '@/utils/pet-reminder-display';
import { buildOverdueReminders } from '@/utils/upcoming-reminders';
import type { PetReminder } from '@/types/pet-reminder';

type OverdueRemindersSectionProps = {
  reminders: PetReminder[];
};

export function OverdueRemindersSection({ reminders }: OverdueRemindersSectionProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);

  const overdue = buildOverdueReminders(reminders, locale, t, { limit: 3 });

  if (overdue.length === 0) {
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
        title={t('dashboard.overdueReminders')}
        icon="exclamationmark.triangle"
        actionLabel={t('dashboard.seeAllReminders')}
        onActionPress={handleSeeAll}
      />
      <Card style={styles.card}>
        {overdue.map((reminder, index) => (
          <ReminderListRow
            key={reminder.key}
            badgeLabel={t('reminders.status.overdue')}
            badgeVariant="overdue"
            backgroundColor={reminder.backgroundColor}
            dateLabel={reminder.dateLabel}
            timeLabel={reminder.timeLabel}
            icon={reminder.icon}
            isLast={index === overdue.length - 1}
            title={reminder.title}
            typeLabel={reminder.typeLabel}
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
