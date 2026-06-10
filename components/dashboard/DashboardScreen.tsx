import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { DailyCheckInProgress } from '@/components/dashboard/DailyCheckInProgress';
import { QuickActionItem } from '@/components/dashboard/QuickActionItem';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ComingSoonModal } from '@/components/ui/ComingSoonModal';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import {
  APPETITE_OPTIONS,
  ENERGY_OPTIONS,
  SYMPTOM_OPTIONS,
} from '@/constants/check-in';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getUpcomingReminder } from '@/services/notifications/upcoming';
import { useCheckInStore } from '@/stores/check-in.store';
import { useNotificationStore } from '@/stores/notification.store';
import { usePetStore } from '@/stores/pet.store';

function getOptionLabel<T extends string>(
  options: { value: T; label: string }[],
  value: T
): string {
  return options.find((option) => option.value === value)?.label ?? value;
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

type NotesPreviewProps = {
  notes: string;
};

function NotesPreview({ notes }: NotesPreviewProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.detailRow}>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.detailLabel}>
        Notes
      </ThemedText>
      <ThemedText type="defaultSemiBold" numberOfLines={2} ellipsizeMode="tail">
        &ldquo;{notes}&rdquo;
      </ThemedText>
    </View>
  );
}

type DashboardScreenProps = {
  edges?: Edge[];
};

export default function DashboardScreen({ edges = ['top', 'bottom'] }: DashboardScreenProps) {
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

  const handleOpenPetProfile = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/pet-profile');
  };

  const handleRetryCheckIn = () => {
    if (!pet?.id) {
      return;
    }

    clearCheckInError();
    void loadCheckIns(pet.id);
  };

  const handleLockedQuickAction = () => {
    setComingSoonVisible(true);
  };

  const handleDismissComingSoon = () => {
    setComingSoonVisible(false);
  };

  const handleOpenNotificationSettings = () => {
    void Linking.openSettings();
  };

  return (
    <ScreenContainer scrollable edges={edges} contentStyle={styles.content}>
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${pet.name} profile`}
            onPress={handleOpenPetProfile}
            style={({ pressed }) => [styles.petProfileAction, { opacity: pressed ? 0.7 : 1 }]}>
            <PetAvatar photoUri={pet.photoUri} size={80} />
            <View style={styles.petInfo}>
              <ThemedText type="title" style={styles.petName}>
                {pet.name}
              </ThemedText>
            </View>
          </Pressable>

          <Button title="Start Check-In" onPress={handleStartCheckIn} />

          <Card>
            <ThemedText type="subtitle">Quick Actions</ThemedText>
            <View style={styles.quickActionsGrid}>
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
            ) : reminderPermission === 'denied' ? (
              <View style={styles.deniedReminder}>
                <ThemedText
                  lightColor={textSecondaryColor}
                  darkColor={textSecondaryColor}
                  style={styles.message}>
                  Notifications are disabled.
                </ThemedText>
                <ThemedText
                  lightColor={textSecondaryColor}
                  darkColor={textSecondaryColor}
                  style={styles.message}>
                  Enable them in Settings.
                </ThemedText>
                <Button
                  title="Open Settings"
                  variant="secondary"
                  onPress={handleOpenNotificationSettings}
                  style={styles.openSettingsButton}
                />
              </View>
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
                {latestCheckIn.notes ? <NotesPreview notes={latestCheckIn.notes} /> : null}
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
                  {checkIn.notes ? <NotesPreview notes={checkIn.notes} /> : null}
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
  petProfileAction: {
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
  deniedReminder: {
    gap: Spacing.sm,
  },
  openSettingsButton: {
    marginTop: Spacing.xs,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
