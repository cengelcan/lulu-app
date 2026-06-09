import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
import { getUpcomingReminder } from '@/services/notifications/upcoming';
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
  const reminderIsLoading = useNotificationStore((state) => state.isLoading);
  const loadNotificationSettings = useNotificationStore((state) => state.loadNotificationSettings);

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

  useEffect(() => {
    if (!pet?.id) {
      return;
    }

    void loadNotificationSettings();
  }, [loadNotificationSettings, pet?.id]);

  const upcomingReminder =
    reminderPermission === 'allowed' ? getUpcomingReminder(reminderPreference) : null;

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

  const handleRetryCheckIn = () => {
    if (!pet?.id) {
      return;
    }

    clearCheckInError();
    void loadCheckIns(pet.id);
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
          <ThemedText type="title">{pet.name}</ThemedText>

          <Button title="Start Check-In" onPress={handleStartCheckIn} />

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
                <DetailRow label="Date" value={upcomingReminder.dateLabel} />
                <DetailRow label="Time" value={upcomingReminder.timeLabel} />
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
});
