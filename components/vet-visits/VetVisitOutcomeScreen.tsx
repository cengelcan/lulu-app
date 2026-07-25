import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import * as vetVisitStorage from '@/storage/vet-visit.storage';
import { useVetVisitStore } from '@/stores/vet-visit.store';
import type { ReminderTime } from '@/types/reminder';
import type { VetVisitBundle } from '@/types/vet-visit';
import { formatLocalDate, getTodayStart } from '@/utils/date';
import { combineVetVisitDateTime, completeVetVisit, splitVetVisitDateTime } from '@/utils/vet-visit';

export function VetVisitOutcomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const saveVisit = useVetVisitStore((state) => state.saveVisit);
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
  const screenOptions = useHubStackScreenOptions(t('vetVisits.outcomeTitle'), '/vet-visits' as Href);

  useEffect(() => {
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
      if (split) {
        setHasNextVisit(true);
        setNextVisitDate(split.date);
        setNextVisitTime(split.time);
      }
    });
    return () => { cancelled = true; };
  }, [id]);

  const validationError = useMemo(() =>
    summary.trim() ? null : t('vetVisits.summaryRequired'), [summary, t]);

  const handleComplete = async () => {
    if (!bundle || validationError) { setError(validationError); return; }
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
        createdAt: bundle.outcome?.createdAt ?? now,
        updatedAt: now,
      }, bundle.visit.completedAt ?? now);
      await saveVisit({
        ...completed,
        visit: { ...completed.visit, updatedAt: now },
      });
      router.dismissTo('/vet-visits' as Href);
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
        footer={<Button title={t('vetVisits.completeVisit')} disabled={!bundle || saving}
          onPress={() => void handleComplete()} />}>
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
                placeholder={t('vetVisits.summaryPlaceholder')} multiline maxLength={1500} />
              <RecordTextField label={t('vetVisits.treatmentNotes')} value={treatmentNotes}
                onChangeText={setTreatmentNotes} placeholder={t('vetVisits.treatmentNotesPlaceholder')}
                multiline maxLength={1500} optional />
            </GroupedSection>
            <GroupedSection title={t('vetVisits.nextVisit')} cardStyle={styles.formCard}>
              <View style={styles.switchRow}>
                <ThemedText type="defaultSemiBold" style={styles.switchCopy}>
                  {t('vetVisits.addNextVisit')}
                </ThemedText>
                <Switch accessibilityLabel={t('vetVisits.addNextVisit')}
                  value={hasNextVisit} onValueChange={setHasNextVisit} />
              </View>
              {hasNextVisit ? (
                <>
                  <DatePickerField accessibilityLabel={t('common.date')} value={nextVisitDate}
                    onChange={setNextVisitDate} minimumDate={getTodayStart()} maximumDate={null}
                    displayFormat="full" />
                  <TimePickerField accessibilityLabel={t('common.time')} label={t('common.time')}
                    value={nextVisitTime} onChange={setNextVisitTime} variant="row" isLast />
                </>
              ) : null}
            </GroupedSection>
          </>
        )}
        {error ? <ThemedText accessibilityRole="alert" style={styles.error}>{error}</ThemedText> : null}
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
  error: { color: '#ef4444' },
});
