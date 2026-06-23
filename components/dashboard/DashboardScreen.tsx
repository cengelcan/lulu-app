import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { DailyCheckInProgress } from '@/components/dashboard/DailyCheckInProgress';
import { GreetingHeader } from '@/components/dashboard/GreetingHeader';
import { PetProfileCard } from '@/components/dashboard/PetProfileCard';
import { QuickActionItem } from '@/components/dashboard/QuickActionItem';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { QUICK_ACTIONS } from '@/constants/quick-actions';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { getUpcomingReminder } from '@/services/notifications/upcoming';
import { useCheckInStore } from '@/stores/check-in.store';
import { useNotificationStore } from '@/stores/notification.store';
import { usePetStore } from '@/stores/pet.store';
import { useUserStore } from '@/stores/user.store';
import { formatLocalDate, getTodayStart } from '@/utils/date';
import { getLatestCheckIn } from '@/utils/last-check-in';

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

type DashboardScreenProps = {
  edges?: Edge[];
};

export default function DashboardScreen({ edges = ['top', 'bottom'] }: DashboardScreenProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const pet = usePetStore((state) => state.pet);
  const isLoading = usePetStore((state) => state.isLoading);
  const error = usePetStore((state) => state.error);
  const loadPet = usePetStore((state) => state.loadPet);
  const clearError = usePetStore((state) => state.clearError);

  const checkIns = useCheckInStore((state) => state.checkIns);
  const loadCheckIns = useCheckInStore((state) => state.loadCheckIns);

  const reminderTime = useNotificationStore((state) => state.reminderTime);
  const reminderPermission = useNotificationStore((state) => state.permission);
  const reminderIsLoading = useNotificationStore((state) => state.isLoading);
  const loadNotificationSettings = useNotificationStore((state) => state.loadNotificationSettings);

  const displayName = useUserStore((state) => state.displayName);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const isDeceased = pet?.status === 'deceased';

  const todayDateString = useMemo(() => formatLocalDate(getTodayStart()), []);
  const todayCheckIn = useMemo(
    () => checkIns.find((checkIn) => checkIn.date === todayDateString) ?? null,
    [checkIns, todayDateString]
  );
  const latestCheckIn = useMemo(() => getLatestCheckIn(checkIns), [checkIns]);

  const ownerName = useMemo(() => {
    const userName = displayName?.trim();
    if (userName) {
      return userName;
    }

    const petOwnerName = pet?.ownerName?.trim();
    return petOwnerName || null;
  }, [displayName, pet?.ownerName]);

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
    reminderPermission === 'allowed' ? getUpcomingReminder(reminderTime, language) : null;

  const handleRetry = () => {
    clearError();
    void loadPet();
  };

  const handleSetupPet = () => {
    router.replace('/(setup)/pet-type');
  };

  const handleOpenPetProfile = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/pet-profile');
  };

  const handleQuickActionPress = (route: (typeof QUICK_ACTIONS)[number]['route']) => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route);
  };

  const handleOpenNotificationSettings = () => {
    void Linking.openSettings();
  };

  return (
    <ScreenContainer scrollable edges={edges} contentStyle={styles.content}>
      {isLoading && !pet ? (
        <View style={styles.centered}>
          <ActivityIndicator color={primaryColor} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <ThemedText style={styles.message}>{error}</ThemedText>
          <Button title={t('common.tryAgain')} onPress={handleRetry} />
        </View>
      ) : !pet ? (
        <View style={styles.centered}>
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            {t('dashboard.noPetTitle')}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.message}>
            {t('dashboard.noPetMessage')}
          </ThemedText>
          <Button title={t('common.setUpPet')} onPress={handleSetupPet} style={styles.setupButton} />
        </View>
      ) : (
        <View style={styles.body}>
          <GreetingHeader
            petName={pet.name}
            ownerName={ownerName}
            todayCheckIn={todayCheckIn}
          />

          <PetProfileCard
            pet={pet}
            todayCheckIn={todayCheckIn}
            latestCheckIn={latestCheckIn}
            onPress={handleOpenPetProfile}
          />

          {isDeceased ? (
            <Card>
              <ThemedText type="subtitle">{t('dashboard.memorialTitle')}</ThemedText>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.message}>
                {t('dashboard.memorialMessage', { name: pet.name })}
              </ThemedText>
            </Card>
          ) : (
            <>
              <DailyCheckInProgress />

              <Card>
                <ThemedText type="subtitle">{t('dashboard.upcomingReminder')}</ThemedText>
                {reminderIsLoading ? (
                  <ActivityIndicator color={primaryColor} style={styles.checkInLoading} />
                ) : reminderPermission === 'later' ? (
                  <ThemedText
                    lightColor={textSecondaryColor}
                    darkColor={textSecondaryColor}
                    style={styles.message}>
                    {t('dashboard.remindersOff')}
                  </ThemedText>
                ) : reminderPermission === 'denied' ? (
                  <View style={styles.deniedReminder}>
                    <ThemedText
                      lightColor={textSecondaryColor}
                      darkColor={textSecondaryColor}
                      style={styles.message}>
                      {t('dashboard.notificationsDisabled')}
                    </ThemedText>
                    <ThemedText
                      lightColor={textSecondaryColor}
                      darkColor={textSecondaryColor}
                      style={styles.message}>
                      {t('dashboard.enableInSettings')}
                    </ThemedText>
                    <Button
                      title={t('settings.openSettings')}
                      variant="secondary"
                      onPress={handleOpenNotificationSettings}
                      style={styles.openSettingsButton}
                    />
                  </View>
                ) : upcomingReminder ? (
                  <>
                    <DetailRow label={t('common.date')} value={upcomingReminder.dateLabel} />
                    <DetailRow label={t('common.time')} value={upcomingReminder.timeLabel} />
                  </>
                ) : (
                  <ThemedText
                    lightColor={textSecondaryColor}
                    darkColor={textSecondaryColor}
                    style={styles.message}>
                    {t('dashboard.noReminderScheduled')}
                  </ThemedText>
                )}
              </Card>
            </>
          )}

          <Card>
            <ThemedText type="subtitle">{t('dashboard.quickActions')}</ThemedText>
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map((action) => (
                <QuickActionItem
                  key={action.id}
                  label={t(action.labelKey)}
                  icon={action.icon}
                  onPress={() => handleQuickActionPress(action.route)}
                />
              ))}
            </View>
          </Card>
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
  deniedReminder: {
    gap: Spacing.sm,
  },
  openSettingsButton: {
    marginTop: Spacing.xs,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
