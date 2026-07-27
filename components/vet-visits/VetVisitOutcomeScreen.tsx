import { type Href, Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { RecordTextField } from '@/components/records/RecordTextField';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ContentState } from '@/components/ui/content-state';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TimePickerField } from '@/components/ui/TimePickerField';
import { Spacing, Typography } from '@/constants/theme';
import { useHubStackScreenOptions } from '@/hooks/use-hub-stack-screen-options';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { trackVetVisitEvent } from '@/services/analytics/vet-visit';
import * as vetVisitStorage from '@/storage/vet-visit.storage';
import { usePetStore } from '@/stores/pet.store';
import { useUserStore } from '@/stores/user.store';
import { useVetVisitStore } from '@/stores/vet-visit.store';
import type { ReminderTime } from '@/types/reminder';
import type { VetVisitBundle } from '@/types/vet-visit';
import { formatLocalDate, getTodayStart } from '@/utils/date';
import { canWriteVetVisit } from '@/utils/pet-access';
import { combineVetVisitDateTime, completeVetVisit, splitVetVisitDateTime } from '@/utils/vet-visit';

export function VetVisitOutcomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const saveVisit = useVetVisitStore((state) => state.saveVisit);
  const pet = usePetStore((state) => state.pet);
  const userId = useUserStore((state) => state.userId);
  const [bundle, setBundle] = useState<VetVisitBundle | null>(null);
  const [summary, setSummary] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [hasNextVisit, setHasNextVisit] = useState(false);
  const [nextVisitDate, setNextVisitDate] = useState(() => formatLocalDate(getTodayStart()));
  const [nextVisitTime, setNextVisitTime] = useState<ReminderTime>({ hour: 9, minute: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const secondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');
  const alertColor = useThemeColor({}, 'alert');
  const screenOptions = useHubStackScreenOptions(t('vetVisits.outcomeTitle'), '/vet-visits' as Href);

  useFocusEffect(useCallback(() => {
    if (!id) return;
    let cancelled = false;
    void vetVisitStorage.getVetVisitBundle(id).then((stored) => {
      if (!stored || cancelled) return;
      setBundle(stored);
      setSummary(stored.outcome?.userEnteredSummary ?? '');
      setTreatmentNotes(stored.outcome?.treatmentNotes ?? '');
      const split = stored.outcome?.nextVisitAt
        ? splitVetVisitDateTime(stored.outcome.nextVisitAt)
        : null;
      setHasNextVisit(Boolean(split));
      if (split) {
        setNextVisitDate(split.date);
        setNextVisitTime(split.time);
      }
    });
    return () => { cancelled = true; };
  }, [id]));

  const validationError = useMemo(() =>
    summary.trim() ? null : t('vetVisits.summaryRequired'), [summary, t]);
  const isReadOnly = Boolean(bundle && pet && !canWriteVetVisit(pet, bundle.visit, userId));
  const isCompleted = bundle?.visit.status === 'completed';

  const handleComplete = async () => {
    if (!bundle || validationError || isReadOnly) { setError(validationError); return; }
    const wasCompleted = bundle.visit.status === 'completed';
    const now = new Date().toISOString();
    const nextVisitAt = hasNextVisit
      ? combineVetVisitDateTime(nextVisitDate, nextVisitTime)
      : null;
    setSaving(true); setError(null);
    try {
      const completed = completeVetVisit(bundle, {
        visitId: bundle.visit.id,
        userEnteredSummary: summary.trim(),
        treatmentNotes: treatmentNotes.trim() || null,
        nextVisitAt,
        followUpReminderId: bundle.outcome?.followUpReminderId ?? null,
        medicationPlanId: bundle.outcome?.medicationPlanId ?? null,
        createdAt: bundle.outcome?.createdAt ?? now,
        updatedAt: now,
      }, bundle.visit.completedAt ?? now);
      const saved = {
        ...completed,
        visit: { ...completed.visit, updatedAt: now },
      };
      await saveVisit(saved);
      if (wasCompleted) {
        router.dismissTo('/vet-visits' as Href);
      } else {
        setBundle(saved);
        void trackVetVisitEvent('visit_completed', 'outcome');
      }
    } catch {
      setError(t('vetVisits.completeFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}
        footer={isReadOnly ? undefined : <Button
          title={isCompleted ? t('vetVisits.saveOutcome') : t('vetVisits.completeVisit')}
          disabled={!bundle || saving} onPress={() => void handleComplete()} />}>
        {!bundle ? (
          <ContentState kind="loading" accessibilityLabel={t('common.loading')} />
        ) : (
          <>
            <View style={styles.intro}>
              <ThemedText lightColor={accent} darkColor={accent} style={styles.userEntered}>
                {t('vetVisits.userEnteredLabel')}
              </ThemedText>
              <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.body}>
                {t('vetVisits.outcomeDescription')}
              </ThemedText>
            </View>
            <GroupedSection title={t('vetVisits.summary')} cardStyle={styles.formCard}>
              <RecordTextField label={t('vetVisits.summary')} value={summary} onChangeText={setSummary}
                placeholder={t('vetVisits.summaryPlaceholder')} multiline maxLength={1500}
                editable={!isReadOnly} />
              <RecordTextField label={t('vetVisits.treatmentNotes')} value={treatmentNotes}
                onChangeText={setTreatmentNotes} placeholder={t('vetVisits.treatmentNotesPlaceholder')}
                multiline maxLength={1500} optional editable={!isReadOnly} />
            </GroupedSection>
            <GroupedSection title={t('vetVisits.nextVisit')} cardStyle={styles.formCard}>
              <View style={styles.switchRow}>
                <ThemedText type="defaultSemiBold" style={styles.switchCopy}>
                  {t('vetVisits.addNextVisit')}
                </ThemedText>
                <Switch accessibilityLabel={t('vetVisits.addNextVisit')}
                  value={hasNextVisit} disabled={isReadOnly} onValueChange={setHasNextVisit} />
              </View>
              {hasNextVisit ? (
                <>
                  <DatePickerField accessibilityLabel={t('common.date')} value={nextVisitDate}
                    onChange={setNextVisitDate} minimumDate={getTodayStart()} maximumDate={null}
                    displayFormat="full" disabled={isReadOnly} />
                  <TimePickerField accessibilityLabel={t('common.time')} label={t('common.time')}
                    value={nextVisitTime} onChange={setNextVisitTime} variant="row" isLast
                    disabled={isReadOnly} />
                </>
              ) : null}
            </GroupedSection>
            {isCompleted ? (
              <GroupedSection title={t('vetVisits.followUpActions')} cardStyle={styles.formCard}>
                <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.caption}>
                  {isReadOnly
                    ? t('vetVisits.sharedVisitReadOnly')
                    : t('vetVisits.followUpDescription')}
                </ThemedText>
                <Button
                  title={bundle.outcome?.followUpReminderId
                    ? t('vetVisits.openReminder')
                    : t('vetVisits.createReminder')}
                  variant="secondary"
                  disabled={isReadOnly}
                  onPress={() => bundle.outcome?.followUpReminderId
                    ? router.push(`/reminders/vet_visit?id=${bundle.outcome.followUpReminderId}` as Href)
                    : router.push({
                      pathname: '/reminders/[type]',
                      params: { type: 'vet_visit', sourceVisitId: bundle.visit.id },
                    })}
                />
                <Button
                  title={bundle.outcome?.medicationPlanId
                    ? t('vetVisits.openMedicationPlan')
                    : t('vetVisits.createMedicationPlan')}
                  variant="secondary"
                  disabled={isReadOnly}
                  onPress={() => bundle.outcome?.medicationPlanId
                    ? router.push(`/medications/${bundle.outcome.medicationPlanId}` as Href)
                    : router.push({
                      pathname: '/medications/[id]',
                      params: { id: 'new', sourceVisitId: bundle.visit.id },
                    })}
                />
                {!bundle.outcome?.medicationPlanId && !isReadOnly ? (
                  <Button title={t('vetVisits.chooseExistingMedicationPlan')} variant="ghost"
                    onPress={() => router.push({
                      pathname: '/medications', params: { sourceVisitId: bundle.visit.id },
                    })} />
                ) : null}
              </GroupedSection>
            ) : null}
          </>
        )}
        {error ? (
          <ThemedText
            accessibilityRole="alert"
            style={[styles.error, { color: alertColor }]}>
            {error}
          </ThemedText>
        ) : null}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.lg, paddingBottom: Spacing.xl },
  intro: { gap: Spacing.xs },
  userEntered: { ...Typography.caption, fontWeight: '700', textTransform: 'uppercase' },
  formCard: { padding: Spacing.md, gap: Spacing.md },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  switchCopy: { flex: 1 },
  error: { textAlign: 'center' },
});
