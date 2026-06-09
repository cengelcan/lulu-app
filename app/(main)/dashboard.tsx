import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { DailyCheckInProgress } from '@/components/dashboard/DailyCheckInProgress';
import { QuickActionItem } from '@/components/dashboard/QuickActionItem';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ComingSoonModal } from '@/components/ui/ComingSoonModal';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import {
  APPETITE_OPTIONS,
  ENERGY_OPTIONS,
  HEALTH_CONDITION_OPTIONS,
  PET_AGE_GROUP_OPTIONS,
  PET_SPECIES_OPTIONS,
  SYMPTOM_OPTIONS,
} from '@/constants/check-in';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  canSkipNextReminder,
  getUpcomingReminder,
} from '@/services/notifications/upcoming';
import { useCheckInStore } from '@/stores/check-in.store';
import { useNotificationStore } from '@/stores/notification.store';
import { usePetStore } from '@/stores/pet.store';
import type { HealthCondition } from '@/types/pet';

function getOptionLabel<T extends string>(
  options: { value: T; label: string }[],
  value: T
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function getHealthConditionLabels(conditions: HealthCondition[]): string[] {
  return conditions.map((condition) =>
    getOptionLabel(HEALTH_CONDITION_OPTIONS, condition)
  );
}

function formatCheckInDateTime(createdAt: string): string {
  const parsed = new Date(createdAt);

  if (Number.isNaN(parsed.getTime())) {
    return createdAt;
  }

  return parsed.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.detailRow}>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.detailLabel}>
        {label}
      </ThemedText>
      <ThemedText type="defaultSemiBold">{value}</ThemedText>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const pet = usePetStore((state) => state.pet);
  const isLoading = usePetStore((state) => state.isLoading);
  const error = usePetStore((state) => state.error);
  const loadPet = usePetStore((state) => state.loadPet);
  const clearError = usePetStore((state) => state.clearError);

  const latestCheckIn = useCheckInStore((state) => state.latestCheckIn);
  const checkIns = useCheckInStore((state) => state.checkIns);
  const checkInIsLoading = useCheckInStore((state) => state.isLoading);
  const checkInError = useCheckInStore((state) => state.error);
  const loadCheckIns = useCheckInStore((state) => state.loadCheckIns);
  const clearCheckInError = useCheckInStore((state) => state.clearError);

  const reminderPreference = useNotificationStore((state) => state.preference);
  const reminderPermission = useNotificationStore((state) => state.permission);
  const skippedReminders = useNotificationStore((state) => state.skippedReminders);
  const skipFeedbackMessage = useNotificationStore((state) => state.skipFeedbackMessage);
  const reminderIsLoading = useNotificationStore((state) => state.isLoading);
  const isSkippingReminder = useNotificationStore((state) => state.isSkipping);
  const loadNotificationSettings = useNotificationStore((state) => state.loadNotificationSettings);
  const skipNextReminder = useNotificationStore((state) => state.skipNextReminder);

  const [comingSoonVisible, setComingSoonVisible] = useState(false);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  useEffect(() => {
    if (!pet?.id) {
      return;
    }

    void loadCheckIns(pet.id);
  }, [loadCheckIns, pet?.id]);

  useFocusEffect(
    useCallback(() => {
      if (!pet?.id) {
        return;
      }

      void loadCheckIns(pet.id);
    }, [loadCheckIns, pet?.id])
  );

  useEffect(() => {
    if (!pet?.id) {
      return;
    }

    void loadNotificationSettings();
  }, [loadNotificationSettings, pet?.id]);

  const upcomingReminder =
    reminderPermission === 'allowed'
      ? getUpcomingReminder(reminderPreference, skippedReminders)
      : null;
  const canSkipReminder =
    reminderPermission === 'allowed' &&
    canSkipNextReminder(reminderPreference, skippedReminders);

  const handleRetry = () => {
    clearError();
    void loadPet();
  };

  const handleSetupPet = () => {
    router.replace('/(setup)/pet-type');
  };

  const handleStartCheckIn = () => {
    router.push('/check-in');
  };

  const handleEditPet = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/edit-pet');
  };

  const handleRetryCheckIn = () => {
    if (!pet?.id) {
      return;
    }

    clearCheckInError();
    void loadCheckIns(pet.id);
  };

  const handleSkipNextReminder = () => {
    void skipNextReminder();
  };

  const handleLockedQuickAction = () => {
    setComingSoonVisible(true);
  };

  const handleDismissComingSoon = () => {
    setComingSoonVisible(false);
  };

  return (
    <ScreenContainer scrollable contentStyle={styles.content}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={primaryColor} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <ThemedText style={styles.message}>{error}</ThemedText>
          <Button title="Try Again" onPress={handleRetry} />
        </View>
      ) : !pet ? (
        <View style={styles.centered}>
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No pet profile yet
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.message}>
            Add your pet to start tracking their health.
          </ThemedText>
          <Button title="Set Up Pet" onPress={handleSetupPet} style={styles.setupButton} />
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.petHeader}>
            <PetAvatar photoUri={pet.photoUri} size={80} />
            <View style={styles.petInfo}>
              <ThemedText type="title" style={styles.petName}>
                {pet.name}
              </ThemedText>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.petSubtitle}>
                {getOptionLabel(PET_SPECIES_OPTIONS, pet.species)} •{' '}
                {getOptionLabel(PET_AGE_GROUP_OPTIONS, pet.ageGroup)}
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit pet"
              onPress={handleEditPet}
              hitSlop={8}
              style={({ pressed }) => [styles.editAction, { opacity: pressed ? 0.6 : 1 }]}>
              <IconSymbol name="pencil" size={15} color={primaryColor} />
              <ThemedText lightColor={primaryColor} darkColor={primaryColor} style={styles.editLabel}>
                Edit
              </ThemedText>
            </Pressable>
          </View>

          <Card>
            <ThemedText type="subtitle">Quick Actions</ThemedText>
            <View style={styles.quickActionsGrid}>
              <QuickActionItem
                label="Start Check-In"
                icon="checkmark.circle.fill"
                onPress={handleStartCheckIn}
              />
              <QuickActionItem
                label="Reports"
                icon="chart.line.uptrend.xyaxis"
                locked
                onPress={handleLockedQuickAction}
              />
              <QuickActionItem
                label="Records"
                icon="doc.text.fill"
                locked
                onPress={handleLockedQuickAction}
              />
              <QuickActionItem
                label="Medication"
                icon="pills.fill"
                locked
                onPress={handleLockedQuickAction}
              />
            </View>
          </Card>

          <DailyCheckInProgress />

          <Card>
            <ThemedText type="subtitle">Upcoming Reminder</ThemedText>
            {reminderIsLoading ? (
              <ActivityIndicator color={primaryColor} style={styles.checkInLoading} />
            ) : reminderPermission === 'later' ? (
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.message}>
                Reminders are off
              </ThemedText>
            ) : upcomingReminder ? (
              <>
                {skipFeedbackMessage ? (
                  <ThemedText style={styles.skipFeedback}>{skipFeedbackMessage}</ThemedText>
                ) : null}
                <DetailRow label="Date" value={upcomingReminder.dateLabel} />
                <DetailRow label="Time" value={upcomingReminder.timeLabel} />
                {canSkipReminder ? (
                  <Button
                    title="Skip Next Reminder"
                    variant="secondary"
                    disabled={isSkippingReminder}
                    onPress={handleSkipNextReminder}
                    style={styles.skipButton}
                  />
                ) : null}
              </>
            ) : (
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.message}>
                No reminder scheduled
              </ThemedText>
            )}
          </Card>

          <Card>
            <ThemedText type="subtitle">Latest Check-In</ThemedText>
            {checkInIsLoading ? (
              <ActivityIndicator color={primaryColor} style={styles.checkInLoading} />
            ) : checkInError ? (
              <View style={styles.checkInError}>
                <ThemedText style={styles.message}>{checkInError}</ThemedText>
                <Button title="Try Again" variant="secondary" onPress={handleRetryCheckIn} />
              </View>
            ) : latestCheckIn ? (
              <>
                <ThemedText
                  lightColor={textSecondaryColor}
                  darkColor={textSecondaryColor}
                  style={styles.checkInDate}>
                  {formatCheckInDateTime(latestCheckIn.createdAt)}
                </ThemedText>
                <DetailRow
                  label="Appetite"
                  value={getOptionLabel(APPETITE_OPTIONS, latestCheckIn.appetite)}
                />
                <DetailRow
                  label="Energy"
                  value={getOptionLabel(ENERGY_OPTIONS, latestCheckIn.energy)}
                />
                <DetailRow
                  label="Symptoms"
                  value={getOptionLabel(SYMPTOM_OPTIONS, latestCheckIn.symptom)}
                />
              </>
            ) : (
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.message}>
                No check-ins yet. Start your first check-in above.
              </ThemedText>
            )}
          </Card>

          <Card>
            <ThemedText type="subtitle">Profile</ThemedText>
            <DetailRow label="Type" value={getOptionLabel(PET_SPECIES_OPTIONS, pet.species)} />
            <DetailRow
              label="Age Group"
              value={getOptionLabel(PET_AGE_GROUP_OPTIONS, pet.ageGroup)}
            />
          </Card>

          <Card>
            <ThemedText type="subtitle">Health Conditions</ThemedText>
            {getHealthConditionLabels(pet.healthConditions).map((label) => (
              <ThemedText key={label} style={styles.conditionItem}>
                {label}
              </ThemedText>
            ))}
          </Card>

          <View style={styles.historySection}>
            <ThemedText type="subtitle">View History</ThemedText>
            {checkInIsLoading ? (
              <ActivityIndicator color={primaryColor} style={styles.checkInLoading} />
            ) : checkInError ? (
              <View style={styles.checkInError}>
                <ThemedText style={styles.message}>{checkInError}</ThemedText>
                <Button title="Try Again" variant="secondary" onPress={handleRetryCheckIn} />
              </View>
            ) : checkIns.length === 0 ? (
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.historyEmpty}>
                No check-in history yet. Complete a check-in to start building your pet&apos;s
                health record.
              </ThemedText>
            ) : (
              checkIns.map((checkIn) => (
                <Card key={checkIn.id}>
                  <ThemedText
                    lightColor={textSecondaryColor}
                    darkColor={textSecondaryColor}
                    style={styles.checkInDate}>
                    {formatCheckInDateTime(checkIn.createdAt)}
                  </ThemedText>
                  <DetailRow
                    label="Appetite"
                    value={getOptionLabel(APPETITE_OPTIONS, checkIn.appetite)}
                  />
                  <DetailRow
                    label="Energy"
                    value={getOptionLabel(ENERGY_OPTIONS, checkIn.energy)}
                  />
                  <DetailRow
                    label="Symptoms"
                    value={getOptionLabel(SYMPTOM_OPTIONS, checkIn.symptom)}
                  />
                </Card>
              ))
            )}
          </View>
        </View>
      )}
      <ComingSoonModal visible={comingSoonVisible} onDismiss={handleDismissComingSoon} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  body: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  petInfo: {
    flex: 1,
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  petName: {
    flexShrink: 1,
  },
  petSubtitle: {
    ...Typography.body,
  },
  editAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: Spacing.sm,
  },
  editLabel: {
    ...Typography.body,
    fontWeight: '400',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    ...Typography.body,
  },
  setupButton: {
    marginTop: Spacing.sm,
  },
  detailRow: {
    gap: Spacing.xs,
  },
  detailLabel: {
    ...Typography.caption,
  },
  conditionItem: {
    ...Typography.body,
  },
  checkInLoading: {
    alignSelf: 'flex-start',
  },
  checkInError: {
    gap: Spacing.sm,
  },
  checkInDate: {
    ...Typography.caption,
  },
  historySection: {
    gap: Spacing.md,
  },
  historyEmpty: {
    ...Typography.body,
  },
  skipFeedback: {
    ...Typography.body,
    textAlign: 'center',
  },
  skipButton: {
    marginTop: Spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
