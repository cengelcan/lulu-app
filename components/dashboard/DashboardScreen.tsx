import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { DailyCheckInProgress } from '@/components/dashboard/DailyCheckInProgress';
import { PetSetupGuideCard } from '@/components/dashboard/PetSetupGuideCard';
import { DashboardSectionHeader } from '@/components/dashboard/DashboardSectionHeader';
import { GreetingHeader } from '@/components/dashboard/GreetingHeader';
import { PetProfileCard } from '@/components/dashboard/PetProfileCard';
import { QuickActionItem } from '@/components/dashboard/QuickActionItem';
import { TrendsSection } from '@/components/dashboard/TrendsSection';
import { OverdueRemindersSection } from '@/components/dashboard/OverdueRemindersSection';
import { UpcomingRemindersSection } from '@/components/dashboard/UpcomingRemindersSection';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { QUICK_ACTIONS } from '@/constants/quick-actions';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { useCheckInStore } from '@/stores/check-in.store';
import { usePetReminderStore } from '@/stores/pet-reminder.store';
import { usePetRecordStore } from '@/stores/pet-record.store';
import { usePetStore } from '@/stores/pet.store';
import { useSetupStore } from '@/stores/setup.store';
import { useUserStore } from '@/stores/user.store';
import { formatLocalDate, getTodayStart } from '@/utils/date';
import { buildDashboardTrends } from '@/utils/trends';
import { translateError } from '@/utils/translate-error';

type DashboardScreenProps = {
  edges?: Edge[];
};

export default function DashboardScreen({ edges = ['top', 'bottom'] }: DashboardScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const pet = usePetStore((state) => state.pet);
  const isLoading = usePetStore((state) => state.isLoading);
  const error = usePetStore((state) => state.error);
  const loadPet = usePetStore((state) => state.loadPet);
  const clearError = usePetStore((state) => state.clearError);

  const checkIns = useCheckInStore((state) => state.checkIns);
  const loadCheckIns = useCheckInStore((state) => state.loadCheckIns);

  const records = usePetRecordStore((state) => state.records);
  const loadRecords = usePetRecordStore((state) => state.loadRecords);

  const reminders = usePetReminderStore((state) => state.reminders);
  const loadReminders = usePetReminderStore((state) => state.loadReminders);

  const displayName = useUserStore((state) => state.displayName);
  const beginSetup = useSetupStore((state) => state.beginSetup);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const isDeceased = pet?.status === 'deceased';

  const todayDateString = useMemo(() => formatLocalDate(getTodayStart()), []);
  const todayCheckIn = useMemo(
    () => checkIns.find((checkIn) => checkIn.date === todayDateString) ?? null,
    [checkIns, todayDateString]
  );
  const trends = useMemo(() => buildDashboardTrends(checkIns, records), [checkIns, records]);

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

  useFocusEffect(
    useCallback(() => {
      const activePetId = usePetStore.getState().pet?.id;
      if (activePetId) {
        void loadCheckIns(activePetId);
      }
    }, [loadCheckIns])
  );

  useEffect(() => {
    if (!pet?.id) {
      return;
    }

    void loadReminders(pet.id);
  }, [loadReminders, pet?.id]);

  useEffect(() => {
    if (!pet?.id) {
      return;
    }

    void loadRecords(pet.id);
  }, [loadRecords, pet?.id]);

  const handleRetry = () => {
    clearError();
    void loadPet();
  };

  const handleSetupPet = () => {
    beginSetup('initial');
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

  return (
    <ScreenContainer scrollable edges={edges} contentStyle={styles.content}>
      {isLoading && !pet ? (
        <View style={styles.centered}>
          <ActivityIndicator color={primaryColor} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <ThemedText style={styles.message}>{translateError(t, error)}</ThemedText>
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
            <DailyCheckInProgress />
          )}

          {!isDeceased ? (
            <PetSetupGuideCard
              pet={pet}
              hasTodayCheckIn={todayCheckIn !== null}
              records={records}
            />
          ) : null}

          <View style={styles.quickActionsSection}>
            <DashboardSectionHeader title={t('dashboard.quickActions')} icon="bolt.fill" />
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map((action) => (
                <QuickActionItem
                  key={action.id}
                  label={t(action.labelKey)}
                  subtitle={t(action.subtitleKey)}
                  icon={action.icon}
                  iconTint={action.iconTint}
                  onPress={() => handleQuickActionPress(action.route)}
                />
              ))}
            </View>
          </View>

          {!isDeceased ? <TrendsSection trends={trends} /> : null}

          {!isDeceased ? <OverdueRemindersSection reminders={reminders} /> : null}
          {!isDeceased ? <UpcomingRemindersSection reminders={reminders} /> : null}
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
  quickActionsSection: {
    gap: Spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
