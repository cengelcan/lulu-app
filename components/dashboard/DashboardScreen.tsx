import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { HealthOverviewCard } from '@/components/dashboard/HealthOverviewCard';
import { DailyCheckInProgress } from '@/components/dashboard/DailyCheckInProgress';
import { JoinRemindersCard } from '@/components/dashboard/JoinRemindersCard';
import { PetSetupGuideCard } from '@/components/dashboard/PetSetupGuideCard';
import { DashboardSectionHeader } from '@/components/dashboard/DashboardSectionHeader';
import { GreetingHeader } from '@/components/dashboard/GreetingHeader';
import { PetProfileCard } from '@/components/dashboard/PetProfileCard';
import { QuickActionItem } from '@/components/dashboard/QuickActionItem';
import { RecentActivitySection } from '@/components/dashboard/RecentActivitySection';
import { TodayCareSection } from '@/components/dashboard/TodayCareSection';
import { TrendsSection } from '@/components/dashboard/TrendsSection';
import { WeightSection } from '@/components/dashboard/WeightSection';
import { UpcomingRemindersSection } from '@/components/dashboard/UpcomingRemindersSection';
import { OverdueRemindersSection } from '@/components/dashboard/OverdueRemindersSection';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ContentState } from '@/components/ui/content-state';
import { QUICK_ACTIONS } from '@/constants/quick-actions';
import { FeatureFlags } from '@/constants/feature-flags';
import { LayoutTokens } from '@/constants/layout';
import { Spacing, Typography } from '@/constants/theme';
import { usePlusFeature } from '@/hooks/use-plus-feature';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { canViewReports } from '@/utils/pet-access';
import { useCheckInStore } from '@/stores/check-in.store';
import { usePetReminderStore } from '@/stores/pet-reminder.store';
import { usePetRecordStore } from '@/stores/pet-record.store';
import { usePetStore } from '@/stores/pet.store';
import { useSetupStore } from '@/stores/setup.store';
import { useUserStore } from '@/stores/user.store';
import { formatLocalDate } from '@/utils/date';
import { buildDashboardTrends } from '@/utils/trends';
import { buildNextCareAction } from '@/utils/dashboard/build-next-care-action';
import { resolveHomeState } from '@/utils/dashboard/resolve-home-state';
import { translateError } from '@/utils/translate-error';

type DashboardScreenProps = {
  edges?: Edge[];
};

export default function DashboardScreen({ edges = ['top', 'bottom'] }: DashboardScreenProps) {
  const router = useRouter();
  const [referenceNow, setReferenceNow] = useState(() => new Date());
  const { fontScale, width } = useWindowDimensions();
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

  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const isDeceased = pet?.status === 'deceased';

  const todayDateString = useMemo(() => formatLocalDate(referenceNow), [referenceNow]);
  const todayCheckIn = useMemo(
    () => checkIns.find((checkIn) => checkIn.date === todayDateString) ?? null,
    [checkIns, todayDateString]
  );
  const trends = useMemo(
    () => buildDashboardTrends(checkIns, referenceNow),
    [checkIns, referenceNow]
  );
  const nextCareAction = useMemo(
    () => buildNextCareAction({ todayCheckIn, reminders, referenceDate: referenceNow }),
    [referenceNow, reminders, todayCheckIn]
  );
  const highlightedUpcomingReminderId =
    nextCareAction.kind === 'upcoming_reminder' ? nextCareAction.reminder.id : undefined;
  const isWideLayout = width >= LayoutTokens.regularWidthBreakpoint && fontScale < 1.4;
  const stackQuickActions = width < LayoutTokens.compactWidthBreakpoint || fontScale >= 1.4;
  const homeState = resolveHomeState({
    pet,
    hasCareData: checkIns.length > 0 || records.length > 0 || reminders.length > 0,
  });
  const { allowed: canExportPdf } = usePlusFeature('pdfExport');
  const { allowed: canCreateRecord } = usePlusFeature('unlimitedRecords');
  const { allowed: canCreateReminder } = usePlusFeature('unlimitedReminders');
  const visibleQuickActions = useMemo(
    () => (pet && canViewReports(pet) ? QUICK_ACTIONS : QUICK_ACTIONS.filter((action) => action.id !== 'reports')),
    [pet]
  );

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

  useFocusEffect(
    useCallback(() => {
      const refreshCurrentTime = () => setReferenceNow(new Date());
      refreshCurrentTime();

      if (pet?.id) {
        void loadCheckIns(pet.id);
        void loadReminders(pet.id);
      }

      const minuteTimer = setInterval(refreshCurrentTime, 60_000);
      return () => clearInterval(minuteTimer);
    }, [loadCheckIns, loadReminders, pet])
  );

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
    <ScreenContainer
      scrollable
      edges={edges}
      maxContentWidth={LayoutTokens.dashboardContentMaxWidth}
      contentStyle={styles.content}>
      {isLoading && !pet ? (
        <ContentState
          kind="loading"
          accessibilityLabel={t('common.loading')}
          style={styles.centered}
          testID="home-loading"
        />
      ) : error ? (
        <ContentState
          kind="error"
          message={translateError(t, error)}
          actionLabel={t('common.tryAgain')}
          onActionPress={handleRetry}
          style={styles.centered}
          testID="home-error"
        />
      ) : !pet ? (
        <ContentState
          kind="empty"
          title={t('dashboard.noPetTitle')}
          message={t('dashboard.noPetMessage')}
          actionLabel={t('common.setUpPet')}
          onActionPress={handleSetupPet}
          style={styles.centered}
          testID="home-state-no_pet"
        />
      ) : (
        <View style={styles.body} testID={`home-state-${homeState}`}>
          <GreetingHeader ownerName={ownerName} />

          <PetProfileCard
            pet={pet}
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
          ) : FeatureFlags.homeHealthOverview ? (
            <View style={[styles.primaryGrid, isWideLayout ? styles.wideGrid : null]}>
              <View style={styles.column}>
                <TodayCareSection action={nextCareAction} petName={pet.name} />
                <PetSetupGuideCard
                  pet={pet}
                  hasTodayCheckIn={todayCheckIn !== null}
                  records={records}
                />
              </View>
              <View style={styles.column}>
                <HealthOverviewCard checkIns={checkIns} petName={pet.name} records={records} />
              </View>
            </View>
          ) : (
            <>
              <DailyCheckInProgress />
              <JoinRemindersCard petName={pet.name} />
              <PetSetupGuideCard
                pet={pet}
                hasTodayCheckIn={todayCheckIn !== null}
                records={records}
              />
            </>
          )}

          <View style={styles.quickActionsSection}>
            <DashboardSectionHeader title={t('dashboard.quickActions')} icon="bolt.fill" />
            <View
              style={[
                styles.quickActionsGrid,
                stackQuickActions ? styles.quickActionsGridStacked : null,
              ]}>
              {visibleQuickActions.map((action) => (
                <QuickActionItem
                  key={action.id}
                  label={t(action.labelKey)}
                  subtitle={t(action.subtitleKey)}
                  icon={action.icon}
                  iconTint={action.iconTint}
                  locked={
                    action.id === 'reports'
                      ? !canExportPdf
                      : action.id === 'records'
                        ? !canCreateRecord
                        : action.id === 'reminder'
                          ? !canCreateReminder
                          : false
                  }
                  lockedLabel={t('common.requiresLuluPlus')}
                  expanded={stackQuickActions}
                  onPress={() => handleQuickActionPress(action.route)}
                />
              ))}
            </View>
          </View>

          {!isDeceased && FeatureFlags.homeHealthOverview ? (
            <JoinRemindersCard petName={pet.name} />
          ) : null}

          {!isDeceased && FeatureFlags.homeHealthOverview ? (
            <UpcomingRemindersSection
              excludedReminderId={highlightedUpcomingReminderId}
              referenceDate={referenceNow}
              reminders={reminders}
            />
          ) : null}

          {!isDeceased && FeatureFlags.homeHealthOverview ? (
            <RecentActivitySection records={records} />
          ) : null}

          {!isDeceased && !FeatureFlags.homeHealthOverview ? (
            <View style={[styles.detailGrid, isWideLayout ? styles.wideGrid : null]}>
              <View style={styles.column}>
                <TrendsSection trends={trends} />
              </View>
              <View style={styles.column}>
                <WeightSection records={records} />
              </View>
            </View>
          ) : null}

          {!isDeceased && !FeatureFlags.homeHealthOverview ? (
            <OverdueRemindersSection reminders={reminders} />
          ) : null}
          {!isDeceased && !FeatureFlags.homeHealthOverview ? (
            <UpcomingRemindersSection referenceDate={referenceNow} reminders={reminders} />
          ) : null}

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
  message: {
    ...Typography.body,
  },
  quickActionsSection: {
    gap: Spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickActionsGridStacked: {
    flexWrap: 'wrap',
  },
  primaryGrid: {
    gap: Spacing.lg,
  },
  detailGrid: {
    gap: Spacing.lg,
  },
  wideGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.lg,
  },
});
