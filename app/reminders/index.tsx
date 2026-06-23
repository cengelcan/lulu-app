import type { Href } from 'expo-router';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { CompletedReminderRow } from '@/components/reminders/CompletedReminderRow';
import { ReminderListRow } from '@/components/reminders/ReminderListRow';
import { ReminderTypeGrid } from '@/components/reminders/ReminderTypeGrid';
import { RemindersFooter } from '@/components/reminders/RemindersFooter';
import { GroupedSection } from '@/components/pet/GroupedSection';
import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { REMINDER_TYPES } from '@/constants/reminder-types';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { usePetReminderStore } from '@/stores/pet-reminder.store';
import { usePetStore } from '@/stores/pet.store';
import type { ReminderTypeId } from '@/types/pet-reminder';
import { getLocaleTag } from '@/utils/locale';
import {
  formatReminderDateTime,
  getReminderFormRoute,
  getReminderTitle,
  getReminderTypeLabelKey,
} from '@/utils/pet-reminder-display';
import { formatCompletedReminderDate } from '@/utils/upcoming-reminders';
import { formatLocalDate, getTodayStart } from '@/utils/date';
import { addDays } from '@/services/notifications/date';

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
  const brandAccentColor = useThemeColor({}, 'brandAccent');
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

  const pendingReminders = useMemo(
    () =>
      reminders
        .filter((reminder) => reminder.status === 'pending')
        .sort((left, right) => {
          const dateCompare = left.dueDate.localeCompare(right.dueDate);
          if (dateCompare !== 0) {
            return dateCompare;
          }

          const leftMinutes = left.dueTime.hour * 60 + left.dueTime.minute;
          const rightMinutes = right.dueTime.hour * 60 + right.dueTime.minute;
          return leftMinutes - rightMinutes;
        }),
    [reminders]
  );

  const completedReminders = useMemo(
    () =>
      reminders
        .filter((reminder) => reminder.status === 'completed')
        .sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? '')),
    [reminders]
  );

  const completedPreview = completedReminders.slice(0, COMPLETED_PREVIEW_LIMIT);
  const isReadOnly = pet?.status === 'deceased';

  const handleAddReminder = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(getReminderFormRoute('custom') as Href);
  };

  const handleTypePress = (type: ReminderTypeId) => {
    router.push(getReminderFormRoute(type) as Href);
  };

  const handleReminderPress = (type: ReminderTypeId, id: string) => {
    router.push(getReminderFormRoute(type, id) as Href);
  };

  const handleSeeAllCompleted = () => {
    router.push('/reminders/completed' as Href);
  };

  return (
    <>
      <Stack.Screen
        options={{
          ...STACK_BACK_ONLY_OPTIONS,
          headerShown: true,
          title: t('reminders.title'),
          headerRight: () =>
            isReadOnly ? null : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('reminders.addReminder')}
                hitSlop={8}
                onPress={handleAddReminder}
                style={({ pressed }) => [
                  styles.addButton,
                  { backgroundColor: brandAccentColor, opacity: pressed ? 0.8 : 1 },
                ]}>
                <IconSymbol name="plus" size={18} color="#ffffff" />
              </Pressable>
            ),
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

        {pendingReminders.length > 0 ? (
          <GroupedSection title={t('reminders.sectionUpcoming')}>
            {pendingReminders.map((reminder, index) => {
              const typeDefinition = REMINDER_TYPES.find((item) => item.id === reminder.type);

              return (
                <ReminderListRow
                  key={reminder.id}
                  badgeLabel={t('reminders.status.upcoming')}
                  backgroundColor={typeDefinition?.backgroundColor ?? '#6b7280'}
                  dateLabel={formatReminderDateTime(
                    reminder.dueDate,
                    reminder.dueTime,
                    locale,
                    todayKey,
                    tomorrowKey,
                    t
                  )}
                  icon={typeDefinition?.icon ?? 'bell.fill'}
                  isLast={index === pendingReminders.length - 1}
                  title={getReminderTitle(reminder, t)}
                  typeLabel={t(getReminderTypeLabelKey(reminder.type))}
                  onPress={() => handleReminderPress(reminder.type, reminder.id)}
                />
              );
            })}
          </GroupedSection>
        ) : isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={primaryColor} />
          </View>
        ) : (
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.subtitle}>
            {t('reminders.emptyUpcoming')}
          </ThemedText>
        )}

        {completedPreview.length > 0 ? (
          <View style={styles.completedSection}>
            <View style={styles.completedHeader}>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.completedTitle}>
                {t('reminders.sectionCompleted')}
              </ThemedText>
              {completedReminders.length > COMPLETED_PREVIEW_LIMIT ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={handleSeeAllCompleted}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                  <ThemedText
                    lightColor={brandAccentColor}
                    darkColor={brandAccentColor}
                    style={styles.seeAll}>
                    {t('reminders.seeAllCompleted')}
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>
            <Card style={styles.completedCard}>
              {completedPreview.map((reminder, index) => {
                const typeDefinition = REMINDER_TYPES.find((item) => item.id === reminder.type);

                return (
                  <CompletedReminderRow
                    key={reminder.id}
                    backgroundColor={typeDefinition?.backgroundColor ?? '#6b7280'}
                    dateLabel={formatCompletedReminderDate(reminder.dueDate, locale)}
                    icon={typeDefinition?.icon ?? 'bell.fill'}
                    isLast={index === completedPreview.length - 1}
                    title={getReminderTitle(reminder, t)}
                    typeLabel={t(getReminderTypeLabelKey(reminder.type))}
                  />
                );
              })}
            </Card>
          </View>
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
  addButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  completedSection: {
    gap: Spacing.xs,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  completedTitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  seeAll: {
    ...Typography.caption,
    fontWeight: '600',
  },
  completedCard: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
});
