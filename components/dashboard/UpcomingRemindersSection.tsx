import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DashboardSectionHeader } from '@/components/dashboard/DashboardSectionHeader';
import { ReminderListRow } from '@/components/reminders/ReminderListRow';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { getLocaleTag } from '@/utils/locale';
import { getReminderFormRoute } from '@/utils/pet-reminder-display';
import { buildUpcomingReminders, hasOverdueReminders } from '@/utils/upcoming-reminders';
import type { PetReminder } from '@/types/pet-reminder';

type UpcomingRemindersSectionProps = {
  reminders: PetReminder[];
};

export function UpcomingRemindersSection({ reminders }: UpcomingRemindersSectionProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const upcoming = buildUpcomingReminders(reminders, locale, t, {
    limit: 3,
  });

  const handleSeeAll = () => {
    router.push('/reminders' as Href);
  };

  const handleAddReminder = () => {
    router.push('/reminders' as Href);
  };

  if (upcoming.length === 0) {
    if (hasOverdueReminders(reminders)) {
      return null;
    }

    return (
      <View style={styles.section}>
        <DashboardSectionHeader title={t('reminders.title')} icon="clock.fill" />
        <Card style={styles.emptyCard}>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.emptyText}>
            {t('reminders.empty')}
          </ThemedText>
          <Button
            title={t('reminders.addReminder')}
            variant="secondary"
            onPress={handleAddReminder}
            style={styles.emptyButton}
          />
        </Card>
      </View>
    );
  }

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
          <ReminderListRow
            key={reminder.key}
            badgeLabel={t('reminders.status.upcoming')}
            backgroundColor={reminder.backgroundColor}
            dateLabel={reminder.dateLabel}
            timeLabel={reminder.timeLabel}
            icon={reminder.icon}
            isLast={index === upcoming.length - 1}
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
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
  emptyButton: {
    alignSelf: 'stretch',
  },
});
