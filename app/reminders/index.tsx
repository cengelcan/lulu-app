import type { Href } from 'expo-router';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CompletedReminderRow } from '@/components/reminders/CompletedReminderRow';
import { ReminderListRow } from '@/components/reminders/ReminderListRow';
import { ReminderTypeGrid } from '@/components/reminders/ReminderTypeGrid';
import { RemindersFooter } from '@/components/reminders/RemindersFooter';
import { GroupedSection } from '@/components/pet/GroupedSection';
import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { REMINDER_TYPES } from '@/constants/reminder-types';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { usePetReminderStore } from '@/stores/pet-reminder.store';
import { usePetStore } from '@/stores/pet.store';
import type { PetReminder, ReminderTypeId } from '@/types/pet-reminder';
import {
  formatCompletedReminderDate,
  formatReminderDateTimeParts,
  listCompletedReminders,
  listOverduePendingReminders,
  listUpcomingPendingReminders,
} from '@/utils/upcoming-reminders';
import { getLocaleTag } from '@/utils/locale';
import {
  getReminderFormRoute,
  getReminderTitle,
  getReminderTypeLabelKey,
} from '@/utils/pet-reminder-display';
import { getRecordFormRoute } from '@/utils/pet-record-display';
import { formatLocalDate, getTodayStart } from '@/utils/date';
import { addDays } from '@/services/notifications/date';
import { reminderTypeToRecordType } from '@/utils/reminder-to-record';

const COMPLETED_PREVIEW_LIMIT = 3;

export default function RemindersScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);

  const pet = usePetStore((state) => state.pet);
  const loadPet = usePetStore((state) => state.loadPet);
  const reminders = usePetReminderStore((state) => state.reminders);
  const isLoading = usePetReminderStore((state) => state.isLoading);
  const loadReminders = usePetReminderStore((state) => state.loadReminders);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const todayKey = useMemo(() => formatLocalDate(getTodayStart()), []);
  const tomorrowKey = useMemo(() => formatLocalDate(addDays(getTodayStart(), 1)), []);

  useFocusEffect(
    useCallback(() => {
      void loadPet();
    }, [loadPet])
  );

  useFocusEffect(
    useCallback(() => {
      if (!pet?.id) {
        return;
      }

      void loadReminders(pet.id);
    }, [loadReminders, pet?.id])
  );

  const overdueReminders = useMemo(() => listOverduePendingReminders(reminders), [reminders]);

  const pendingReminders = useMemo(() => listUpcomingPendingReminders(reminders), [reminders]);

  const completedReminders = useMemo(() => listCompletedReminders(reminders), [reminders]);

  const completedPreview = completedReminders.slice(0, COMPLETED_PREVIEW_LIMIT);
  const isReadOnly = pet?.status === 'deceased';

  const handleTypePress = (type: ReminderTypeId) => {
    router.push(getReminderFormRoute(type) as Href);
  };

  const handleReminderPress = (type: ReminderTypeId, id: string) => {
    router.push(getReminderFormRoute(type, id) as Href);
  };

  const handleSeeAllCompleted = () => {
    router.push('/reminders/completed' as Href);
  };

  const handleCompletedReminderPress = (reminder: PetReminder) => {
    if (!reminder.recordId) {
      return;
    }

    const recordType = reminderTypeToRecordType(reminder.type);
    router.push(getRecordFormRoute(recordType, reminder.recordId) as Href);
  };

  return (
    <>
      <Stack.Screen
        options={{
          ...STACK_BACK_ONLY_OPTIONS,
          headerShown: true,
          title: t('reminders.title'),
        }}
      />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        {isReadOnly ? (
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.subtitle}>
            {t('reminders.deceasedReadOnly')}
          </ThemedText>
        ) : (
          <GroupedSection title={t('reminders.sectionCreate')}>
            <ReminderTypeGrid
              getGridLabel={(key) => t(key)}
              getGridSubtitle={(key) => t(key)}
              onPressType={handleTypePress}
            />
          </GroupedSection>
        )}

        {overdueReminders.length > 0 ? (
          <GroupedSection title={t('reminders.sectionOverdue')}>
            {overdueReminders.map((reminder, index) => {
              const typeDefinition = REMINDER_TYPES.find((item) => item.id === reminder.type);
              const { dateLabel, timeLabel } = formatReminderDateTimeParts(
                reminder.dueDate,
                reminder.dueTime,
                locale,
                todayKey,
                tomorrowKey,
                t
              );

              return (
                <ReminderListRow
                  key={reminder.id}
                  badgeLabel={t('reminders.status.overdue')}
                  badgeVariant="overdue"
                  backgroundColor={typeDefinition?.backgroundColor ?? '#6b7280'}
                  dateLabel={dateLabel}
                  timeLabel={timeLabel}
                  icon={typeDefinition?.icon ?? 'bell.fill'}
                  isLast={index === overdueReminders.length - 1}
                  title={getReminderTitle(reminder, t)}
                  typeLabel={t(getReminderTypeLabelKey(reminder.type))}
                  onPress={() => handleReminderPress(reminder.type, reminder.id)}
                />
              );
            })}
          </GroupedSection>
        ) : null}

        {pendingReminders.length > 0 ? (
          <GroupedSection title={t('reminders.sectionUpcoming')}>
            {pendingReminders.map((reminder, index) => {
              const typeDefinition = REMINDER_TYPES.find((item) => item.id === reminder.type);
              const { dateLabel, timeLabel } = formatReminderDateTimeParts(
                reminder.dueDate,
                reminder.dueTime,
                locale,
                todayKey,
                tomorrowKey,
                t
              );

              return (
                <ReminderListRow
                  key={reminder.id}
                  badgeLabel={t('reminders.status.upcoming')}
                  backgroundColor={typeDefinition?.backgroundColor ?? '#6b7280'}
                  dateLabel={dateLabel}
                  timeLabel={timeLabel}
                  icon={typeDefinition?.icon ?? 'bell.fill'}
                  isLast={index === pendingReminders.length - 1}
                  title={getReminderTitle(reminder, t)}
                  typeLabel={t(getReminderTypeLabelKey(reminder.type))}
                  onPress={() => handleReminderPress(reminder.type, reminder.id)}
                />
              );
            })}
          </GroupedSection>
        ) : overdueReminders.length === 0 && isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={primaryColor} />
          </View>
        ) : overdueReminders.length === 0 ? (
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.subtitle}>
            {t('reminders.emptyUpcoming')}
          </ThemedText>
        ) : null}

        {completedPreview.length > 0 ? (
          <GroupedSection
            actionLabel={
              completedReminders.length > COMPLETED_PREVIEW_LIMIT
                ? t('reminders.seeAllCompleted')
                : undefined
            }
            title={t('reminders.sectionCompleted')}
            onActionPress={
              completedReminders.length > COMPLETED_PREVIEW_LIMIT ? handleSeeAllCompleted : undefined
            }>
            {completedPreview.map((reminder, index) => (
              <CompletedReminderRow
                key={reminder.id}
                dateLabel={formatCompletedReminderDate(reminder.dueDate, locale)}
                isLast={index === completedPreview.length - 1}
                title={getReminderTitle(reminder, t)}
                typeLabel={t(getReminderTypeLabelKey(reminder.type))}
                onPress={
                  reminder.recordId ? () => handleCompletedReminderPress(reminder) : undefined
                }
              />
            ))}
          </GroupedSection>
        ) : null}

        <RemindersFooter />
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    paddingHorizontal: Spacing.xs,
  },
  loadingRow: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
});
