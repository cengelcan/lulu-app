import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { DashboardSectionHeader } from '@/components/dashboard/DashboardSectionHeader';
import { RemindersEmptyIllustration } from '@/components/dashboard/RemindersEmptyIllustration';
import { ReminderListRow } from '@/components/reminders/ReminderListRow';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { getLocaleTag } from '@/utils/locale';
import { getReminderFormRoute } from '@/utils/pet-reminder-display';
import { buildUpcomingReminders, hasOverdueReminders } from '@/utils/upcoming-reminders';
import type { PetReminder } from '@/types/pet-reminder';

const REMINDER_ACCENT = Palette.badgeViolet;

type UpcomingRemindersSectionProps = {
  reminders: PetReminder[];
};

export function UpcomingRemindersSection({ reminders }: UpcomingRemindersSectionProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);
  const titleColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceSoftColor = useThemeColor({}, 'surfaceSoft');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');

  const upcoming = buildUpcomingReminders(reminders, locale, t, {
    limit: 3,
  });

  const handleSeeAll = () => {
    router.push('/reminders' as Href);
  };

  const handleAddReminder = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/reminders' as Href);
  };

  if (upcoming.length === 0) {
    if (hasOverdueReminders(reminders)) {
      return null;
    }

    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: brandAccentSoft }]}>
            <IconSymbol name="clock.fill" size={18} color={REMINDER_ACCENT} />
          </View>
          <ThemedText
            lightColor={titleColor}
            darkColor={titleColor}
            style={styles.headerTitle}>
            {t('reminders.title')}
          </ThemedText>
        </View>

        <View
          style={[
            styles.emptyContainer,
            { borderColor, backgroundColor: surfaceSoftColor },
          ]}>
          <View style={styles.emptyContent}>
            <RemindersEmptyIllustration
              accentColor={REMINDER_ACCENT}
              borderColor={borderColor}
            />
            <View style={styles.emptyTextBlock}>
              <ThemedText
                lightColor={titleColor}
                darkColor={titleColor}
                style={styles.emptyTitle}>
                {t('reminders.emptyTitle')}
              </ThemedText>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.emptyDescription}>
                {t('reminders.emptyDescription')}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('reminders.addReminder')}
                onPress={handleAddReminder}
                style={({ pressed }) => [
                  styles.emptyButton,
                  { borderColor: REMINDER_ACCENT, opacity: pressed ? 0.75 : 1 },
                ]}>
                <IconSymbol name="plus" size={16} color={REMINDER_ACCENT} />
                <ThemedText
                  lightColor={REMINDER_ACCENT}
                  darkColor={REMINDER_ACCENT}
                  style={styles.emptyButtonLabel}>
                  {t('reminders.addReminder')}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Card>
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
  container: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.bodySemiBold,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    flex: 1,
  },
  card: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
  emptyContainer: {
    width: '100%',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  emptyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyTextBlock: {
    flex: 1,
    gap: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  emptyDescription: {
    ...Typography.caption,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xxs,
    minHeight: 40,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xxs,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  emptyButtonLabel: {
    ...Typography.button,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
});
