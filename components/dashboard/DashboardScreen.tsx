import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { DailyCheckInProgress } from '@/components/dashboard/DailyCheckInProgress';
import { QuickActionItem } from '@/components/dashboard/QuickActionItem';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { QUICK_ACTIONS } from '@/constants/quick-actions';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';
import { getUpcomingReminder } from '@/services/notifications/upcoming';
import { useCheckInStore } from '@/stores/check-in.store';
import { useNotificationStore } from '@/stores/notification.store';
import { usePetStore } from '@/stores/pet.store';
import type { CheckIn } from '@/types/check-in';
import { getAbnormalCheckInFields } from '@/utils/check-in';
import { formatLocalDate, getTodayStart } from '@/utils/date';

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
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.detailRow}>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.detailLabel}>
        {t('dashboard.notes')}
      </ThemedText>
      <ThemedText type="defaultSemiBold" numberOfLines={2} ellipsizeMode="tail">
        &ldquo;{notes}&rdquo;
      </ThemedText>
    </View>
  );
}

type TodaysCheckInCardProps = {
  checkIn: CheckIn | null;
  isLoading: boolean;
  error: string | null;
  onPress: () => void;
  onRetry: () => void;
};

function TodaysCheckInCard({
  checkIn,
  isLoading,
  error,
  onPress,
  onRetry,
}: TodaysCheckInCardProps) {
  const { t } = useTranslation();
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const successColor = useThemeColor({}, 'success');

  const abnormalFields = checkIn ? getAbnormalCheckInFields(checkIn) : [];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        checkIn ? t('dashboard.todaysCheckInUpdate') : t('dashboard.todaysCheckInStart')
      }
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
      <Card>
        <View style={styles.cardHeader}>
          <ThemedText type="subtitle">{t('dashboard.todaysCheckIn')}</ThemedText>
          <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
        </View>
        {isLoading && !checkIn ? (
          <ActivityIndicator color={primaryColor} style={styles.checkInLoading} />
        ) : error ? (
          <View style={styles.checkInError}>
            <ThemedText style={styles.message}>{error}</ThemedText>
            <Button title={t('common.tryAgain')} variant="secondary" onPress={onRetry} />
          </View>
        ) : checkIn ? (
          <>
            {abnormalFields.length === 0 ? (
              <View style={styles.allNormalRow}>
                <IconSymbol name="checkmark.circle" size={18} color={successColor} />
                <ThemedText type="defaultSemiBold" style={styles.allNormalText}>
                  {t('dashboard.allNormalToday')}
                </ThemedText>
              </View>
            ) : (
              abnormalFields.map((field) => (
                <DetailRow
                  key={field.category}
                  label={t(field.categoryTranslationKey)}
                  value={t(field.valueTranslationKey)}
                />
              ))
            )}
            {checkIn.notes ? <NotesPreview notes={checkIn.notes} /> : null}
          </>
        ) : (
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.message}>
            {t('dashboard.notCheckedIn')}
          </ThemedText>
        )}
      </Card>
    </Pressable>
  );
}

type DashboardScreenProps = {
  edges?: Edge[];
};

export default function DashboardScreen({ edges = ['top', 'bottom'] }: DashboardScreenProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { displayPetSpecies } = usePetDisplay();
  const pet = usePetStore((state) => state.pet);
  const isLoading = usePetStore((state) => state.isLoading);
  const error = usePetStore((state) => state.error);
  const loadPet = usePetStore((state) => state.loadPet);
  const clearError = usePetStore((state) => state.clearError);

  const checkIns = useCheckInStore((state) => state.checkIns);
  const checkInIsLoading = useCheckInStore((state) => state.isLoading);
  const checkInError = useCheckInStore((state) => state.error);
  const loadCheckIns = useCheckInStore((state) => state.loadCheckIns);
  const clearCheckInError = useCheckInStore((state) => state.clearError);

  const reminderTime = useNotificationStore((state) => state.reminderTime);
  const reminderPermission = useNotificationStore((state) => state.permission);
  const reminderIsLoading = useNotificationStore((state) => state.isLoading);
  const loadNotificationSettings = useNotificationStore((state) => state.loadNotificationSettings);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const isDeceased = pet?.status === 'deceased';

  const todayDateString = useMemo(() => formatLocalDate(getTodayStart()), []);
  const todayCheckIn = useMemo(
    () => checkIns.find((checkIn) => checkIn.date === todayDateString) ?? null,
    [checkIns, todayDateString]
  );

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

  const handleOpenTodaysCheckIn = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/check-in?date=${todayDateString}`);
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.petProfileA11y', { name: pet.name })}
            onPress={handleOpenPetProfile}
            style={({ pressed }) => [styles.petProfileAction, { opacity: pressed ? 0.7 : 1 }]}>
            <PetAvatar photoUri={pet.photoUri} size={88} />
            <View style={styles.petHeaderCenter}>
              <ThemedText type="title" style={styles.petName}>
                {pet.name}
              </ThemedText>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.petSpecies}>
                {displayPetSpecies(pet.species)}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color={textSecondaryColor} />
          </Pressable>

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

              <TodaysCheckInCard
                checkIn={todayCheckIn}
                error={checkInError}
                isLoading={checkInIsLoading}
                onPress={handleOpenTodaysCheckIn}
                onRetry={handleRetryCheckIn}
              />

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
  petProfileAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  petHeaderCenter: {
    flex: 1,
    gap: Spacing.xs,
  },
  petName: {
    textAlign: 'left',
  },
  petSpecies: {
    ...Typography.body,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allNormalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  allNormalText: {
    ...Typography.body,
  },
  checkInLoading: {
    alignSelf: 'flex-start',
  },
  checkInError: {
    gap: Spacing.sm,
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
