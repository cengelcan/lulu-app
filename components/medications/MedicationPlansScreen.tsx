import { type Href, Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { MedicationDoseRow } from '@/components/medications/MedicationDoseRow';
import { MedicationPlanRow } from '@/components/medications/MedicationPlanRow';
import { GroupedSection } from '@/components/pet/GroupedSection';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ContentState } from '@/components/ui/content-state';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing, Typography } from '@/constants/theme';
import { useHubStackScreenOptions } from '@/hooks/use-hub-stack-screen-options';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { linkFollowUpToVetVisit } from '@/services/vet-visits/link-follow-up';
import { useMedicationStore } from '@/stores/medication.store';
import { usePetStore } from '@/stores/pet.store';
import { formatLocalDate } from '@/utils/date';

export function MedicationPlansScreen() {
  const router = useRouter();
  const { doseId: rawDoseId, sourceVisitId: rawSourceVisitId } = useLocalSearchParams<{
    doseId?: string | string[];
    sourceVisitId?: string | string[];
  }>();
  const doseId = Array.isArray(rawDoseId) ? rawDoseId[0] : rawDoseId;
  const sourceVisitId = Array.isArray(rawSourceVisitId) ? rawSourceVisitId[0] : rawSourceVisitId;
  const { t } = useTranslation();
  const pet = usePetStore((state) => state.pet);
  const loadPet = usePetStore((state) => state.loadPet);
  const bundles = useMedicationStore((state) => state.bundles);
  const isLoading = useMedicationStore((state) => state.isLoading);
  const loadPlans = useMedicationStore((state) => state.loadPlans);
  const doses = useMedicationStore((state) => state.doses);
  const loadDoses = useMedicationStore((state) => state.loadDoses);
  const takeDose = useMedicationStore((state) => state.takeDose);
  const skipDose = useMedicationStore((state) => state.skipDose);
  const snoozeDose = useMedicationStore((state) => state.snoozeDose);
  const [busyDoseId, setBusyDoseId] = useState<string | null>(null);
  const [selectingPlanId, setSelectingPlanId] = useState<string | null>(null);
  const [doseError, setDoseError] = useState<string | null>(null);
  const [referenceNow] = useState(() => Date.now());
  const secondary = useThemeColor({}, 'textSecondary');
  const screenOptions = useHubStackScreenOptions(t('medications.title'));

  useFocusEffect(useCallback(() => { void loadPet(); }, [loadPet]));
  useFocusEffect(useCallback(() => {
    if (!pet?.id) return;
    const today = formatLocalDate(new Date());
    void (async () => {
      await loadPlans(pet.id);
      await loadDoses(pet.id, today, today);
    })();
  }, [loadDoses, loadPlans, pet]));

  const active = useMemo(() => bundles.filter(({ plan }) => plan.status === 'active'), [bundles]);
  const past = useMemo(() => bundles.filter(({ plan }) => plan.status !== 'active'), [bundles]);
  const planById = useMemo(() => new Map(bundles.map(({ plan }) => [plan.id, plan])), [bundles]);

  const runDoseAction = async (id: string, action: (id: string) => Promise<void>) => {
    setBusyDoseId(id); setDoseError(null);
    try { await action(id); }
    catch { setDoseError(t('medications.doseActionFailed')); }
    finally { setBusyDoseId(null); }
  };

  const handlePlanPress = async (planId: string) => {
    if (!sourceVisitId) {
      router.push(`/medications/${planId}` as Href);
      return;
    }
    setSelectingPlanId(planId); setDoseError(null);
    try {
      await linkFollowUpToVetVisit(sourceVisitId, 'medication', planId);
      router.replace(`/vet-visits/outcome/${sourceVisitId}` as Href);
    } catch {
      setDoseError(t('vetVisits.followUpLinkFailed'));
    } finally {
      setSelectingPlanId(null);
    }
  };

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={{ gap: Spacing.lg }}>
        <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.body}>
          {sourceVisitId ? t('vetVisits.chooseMedicationPlanDescription') : t('medications.description')}
        </ThemedText>
        <Button title={t('medications.addPlan')} onPress={() => router.push({
          pathname: '/medications/[id]',
          params: sourceVisitId ? { id: 'new', sourceVisitId } : { id: 'new' },
        })} />
        {!sourceVisitId ? (doses.length > 0 ? (
            <GroupedSection title={t('medications.todayDoses')} cardStyle={{ gap: Spacing.xs }}>
              {doses.map((dose) => {
                const plan = planById.get(dose.planId);
                return plan ? <MedicationDoseRow key={dose.id} dose={dose} plan={plan} referenceNow={referenceNow}
                  highlighted={dose.id === doseId} busy={busyDoseId === dose.id}
                  onTake={() => void runDoseAction(dose.id, takeDose)}
                  onSkip={() => void runDoseAction(dose.id, skipDose)}
                  onSnooze={() => void runDoseAction(dose.id, snoozeDose)} /> : null;
              })}
            </GroupedSection>
          ) : !isLoading && active.length > 0 ? (
            <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.caption}>
              {t('medications.emptyDoses')}
            </ThemedText>
          ) : null) : null}
        {doseError ? <ThemedText accessibilityRole="alert" selectable>{doseError}</ThemedText> : null}
        {isLoading && bundles.length === 0 ? (
          <ContentState kind="loading" accessibilityLabel={t('common.loading')} />
        ) : active.length === 0 ? (
          <ContentState kind="empty" presentation="card" title={t('medications.emptyTitle')}
            message={t('medications.emptyDescription')} />
        ) : (
          <GroupedSection title={t('medications.active')}>
            {active.map(({ plan, inventory }, index) => <MedicationPlanRow key={plan.id} plan={plan} inventory={inventory}
              isLast={index === active.length - 1}
              onPress={() => { if (!selectingPlanId) void handlePlanPress(plan.id); }} />)}
          </GroupedSection>
        )}
        {past.length > 0 ? (
          <GroupedSection title={t('medications.past')}>
            {past.map(({ plan, inventory }, index) => <MedicationPlanRow key={plan.id} plan={plan} inventory={inventory}
              isLast={index === past.length - 1}
              onPress={() => { if (!selectingPlanId) void handlePlanPress(plan.id); }} />)}
          </GroupedSection>
        ) : null}
      </ScreenContainer>
    </>
  );
}
