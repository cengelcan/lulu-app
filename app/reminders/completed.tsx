import type { Href } from 'expo-router';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CompletedReminderRow } from '@/components/reminders/CompletedReminderRow';
import { GroupedSection } from '@/components/pet/GroupedSection';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { REMINDER_TYPES } from '@/constants/reminder-types';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { usePetReminderStore } from '@/stores/pet-reminder.store';
import { usePetStore } from '@/stores/pet.store';
import { getLocaleTag } from '@/utils/locale';
import { getRecordFormRoute } from '@/utils/pet-record-display';
import { getReminderTitle, getReminderTypeLabelKey } from '@/utils/pet-reminder-display';
import { reminderTypeToRecordType } from '@/utils/reminder-to-record';
import { formatCompletedReminderDate } from '@/utils/upcoming-reminders';

export default function CompletedRemindersScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);

  const pet = usePetStore((state) => state.pet);
  const loadPet = usePetStore((state) => state.loadPet);
  const reminders = usePetReminderStore((state) => state.reminders);
  const isLoading = usePetReminderStore((state) => state.isLoading);
  const loadReminders = usePetReminderStore((state) => state.loadReminders);

  const primaryColor = useThemeColor({}, 'primary');

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

  const completedReminders = useMemo(
    () =>
      reminders
        .filter((reminder) => reminder.status === 'completed')
        .sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? '')),
    [reminders]
  );

  const handleReminderPress = (reminder: (typeof completedReminders)[number]) => {
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
          title: t('reminders.completedTitle'),
        }}
      />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        {isLoading && completedReminders.length === 0 ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={primaryColor} />
          </View>
        ) : completedReminders.length > 0 ? (
          <GroupedSection title={t('reminders.sectionCompleted')}>
            {completedReminders.map((reminder, index) => {
              const typeDefinition = REMINDER_TYPES.find((item) => item.id === reminder.type);

              return (
                <CompletedReminderRow
                  key={reminder.id}
                  backgroundColor={typeDefinition?.backgroundColor ?? '#6b7280'}
                  dateLabel={formatCompletedReminderDate(reminder.dueDate, locale)}
                  icon={typeDefinition?.icon ?? 'bell.fill'}
                  isLast={index === completedReminders.length - 1}
                  title={getReminderTitle(reminder, t)}
                  typeLabel={t(getReminderTypeLabelKey(reminder.type))}
                  onPress={
                    reminder.recordId ? () => handleReminderPress(reminder) : undefined
                  }
                />
              );
            })}
          </GroupedSection>
        ) : null}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  loadingRow: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
});
