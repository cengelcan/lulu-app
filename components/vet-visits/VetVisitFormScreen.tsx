import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { RecordTextField } from '@/components/records/RecordTextField';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TimePickerField } from '@/components/ui/TimePickerField';
import { VetVisitQuestionEditor } from '@/components/vet-visits/VetVisitQuestionEditor';
import { Spacing, Typography } from '@/constants/theme';
import { useHubStackScreenOptions } from '@/hooks/use-hub-stack-screen-options';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import * as vetVisitStorage from '@/storage/vet-visit.storage';
import { usePetStore } from '@/stores/pet.store';
import { useVetVisitStore } from '@/stores/vet-visit.store';
import type { ReminderTime } from '@/types/reminder';
import type { VetVisitBundle } from '@/types/vet-visit';
import { formatLocalDate, getTodayStart } from '@/utils/date';
import { combineVetVisitDateTime, createVetVisitId, splitVetVisitDateTime, startVetVisit } from '@/utils/vet-visit';

type DraftQuestion = { id: string; text: string; createdAt: string };

export function VetVisitFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const pet = usePetStore((state) => state.pet);
  const saveVisit = useVetVisitStore((state) => state.saveVisit);
  const deleteVisit = useVetVisitStore((state) => state.deleteVisit);
  const [existing, setExisting] = useState<VetVisitBundle | null>(null);
  const [date, setDate] = useState(() => formatLocalDate(getTodayStart()));
  const [time, setTime] = useState<ReminderTime>({ hour: 9, minute: 0 });
  const [providerName, setProviderName] = useState('');
  const [reason, setReason] = useState('');
  const [attachHealthReport, setAttachHealthReport] = useState(false);
  const [reportStartDate, setReportStartDate] = useState(() => {
    const start = getTodayStart();
    start.setDate(start.getDate() - 29);
    return formatLocalDate(start);
  });
  const [reportEndDate, setReportEndDate] = useState(() => formatLocalDate(getTodayStart()));
  const [questions, setQuestions] = useState<DraftQuestion[]>(() => [
    { id: createVetVisitId(), text: '', createdAt: new Date().toISOString() },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const secondary = useThemeColor({}, 'textSecondary');
  const isNew = id === 'new';
  const screenOptions = useHubStackScreenOptions(
    isNew ? t('vetVisits.newVisit') : t('vetVisits.editVisit'), '/vet-visits' as Href
  );

  useEffect(() => {
    if (!id || isNew) return;
    let cancelled = false;
    void vetVisitStorage.getVetVisitBundle(id).then((bundle) => {
      if (!bundle || cancelled) return;
      const split = splitVetVisitDateTime(bundle.visit.scheduledAt);
      setExisting(bundle);
      if (split) { setDate(split.date); setTime(split.time); }
      setProviderName(bundle.visit.providerName ?? '');
      setReason(bundle.visit.reason);
      setAttachHealthReport(Boolean(bundle.visit.healthReportStartDate && bundle.visit.healthReportEndDate));
      if (bundle.visit.healthReportStartDate) setReportStartDate(bundle.visit.healthReportStartDate);
      if (bundle.visit.healthReportEndDate) setReportEndDate(bundle.visit.healthReportEndDate);
      setQuestions(bundle.questions.map((question) => ({
        id: question.id, text: question.text, createdAt: question.createdAt,
      })));
    });
    return () => { cancelled = true; };
  }, [id, isNew]);

  const validationError = useMemo(() => {
    if (!combineVetVisitDateTime(date, time)) return t('vetVisits.dateRequired');
    if (!reason.trim()) return t('vetVisits.reasonRequired');
    if (!questions.some((question) => question.text.trim())) return t('vetVisits.questionRequired');
    if (attachHealthReport && reportStartDate > reportEndDate) return t('reports.validation.invalidRange');
    return null;
  }, [attachHealthReport, date, questions, reason, reportEndDate, reportStartDate, t, time]);

  const updateQuestion = (index: number, text: string) =>
    setQuestions((current) => current.map((question, itemIndex) =>
      itemIndex === index ? { ...question, text } : question
    ));
  const moveQuestion = (index: number, offset: number) => setQuestions((current) => {
    const next = [...current];
    const target = index + offset;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });

  const persistVisit = async (start = false) => {
    if (!pet?.id || validationError) { setError(validationError); return; }
    const scheduledAt = combineVetVisitDateTime(date, time);
    if (!scheduledAt) { setError(t('vetVisits.dateRequired')); return; }
    const now = new Date().toISOString();
    const visitId = existing?.visit.id ?? createVetVisitId();
    const keptQuestions = questions.filter((question) => question.text.trim());
    setSaving(true); setError(null);
    try {
      const bundle: VetVisitBundle = {
        visit: {
          id: visitId, petId: pet.id, scheduledAt,
          providerId: existing?.visit.providerId ?? null,
          providerName: providerName.trim() || null, reason: reason.trim(),
          generalNotes: existing?.visit.generalNotes ?? null,
          status: existing?.visit.status ?? 'planned',
          healthReportStartDate: attachHealthReport ? reportStartDate : null,
          healthReportEndDate: attachHealthReport ? reportEndDate : null,
          startedAt: existing?.visit.startedAt ?? null,
          completedAt: existing?.visit.completedAt ?? null,
          createdAt: existing?.visit.createdAt ?? now, updatedAt: now,
        },
        questions: keptQuestions.map((question, index) => ({
          id: question.id, visitId, text: question.text.trim(),
          answer: existing?.questions.find((item) => item.id === question.id)?.answer ?? null,
          isAnswered: existing?.questions.find((item) => item.id === question.id)?.isAnswered ?? false,
          sortOrder: index, createdAt: question.createdAt, updatedAt: now,
        })),
        outcome: existing?.outcome ?? null,
      };
      const savedBundle = start ? startVetVisit(bundle, now) : bundle;
      await saveVisit(savedBundle);
      if (start) {
        router.replace(`/vet-visits/live/${visitId}` as Href);
      } else {
        router.replace('/vet-visits' as Href);
      }
    } catch { setError(t('vetVisits.saveFailed')); }
    finally { setSaving(false); }
  };

  const handleDelete = () => {
    if (!existing || !pet) return;
    Alert.alert(t('vetVisits.deleteTitle'), t('vetVisits.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void (async () => {
        await deleteVisit(existing.visit.id, pet.id);
        router.replace('/vet-visits' as Href);
      })() },
    ]);
  };

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <ScreenContainer
        scrollable edges={['bottom']} contentStyle={styles.content}
        footer={<Button title={t('vetVisits.save')} disabled={saving} onPress={() => void persistVisit()} />}>
        <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.body}>
          {t('vetVisits.description')}
        </ThemedText>
        <GroupedSection title={t('vetVisits.appointment')} cardStyle={styles.formCard}>
          <DatePickerField accessibilityLabel={t('common.date')} value={date} onChange={setDate}
            minimumDate={getTodayStart()} maximumDate={null} displayFormat="full" />
          <TimePickerField accessibilityLabel={t('common.time')} label={t('common.time')}
            value={time} onChange={setTime} variant="row" isLast />
          <RecordTextField label={t('vetVisits.clinic')} value={providerName} onChangeText={setProviderName}
            placeholder={t('vetVisits.clinicPlaceholder')} optional maxLength={120} />
          <RecordTextField label={t('vetVisits.reason')} value={reason} onChangeText={setReason}
            placeholder={t('vetVisits.reasonPlaceholder')} multiline maxLength={500} />
        </GroupedSection>
        <GroupedSection title={t('vetVisits.healthReport')} cardStyle={styles.formCard}>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <ThemedText type="defaultSemiBold">{t('vetVisits.attachHealthReport')}</ThemedText>
              <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.caption}>
                {t('vetVisits.healthReportDescription')}
              </ThemedText>
            </View>
            <Switch accessibilityLabel={t('vetVisits.attachHealthReport')}
              value={attachHealthReport} onValueChange={setAttachHealthReport} />
          </View>
          {attachHealthReport ? (
            <>
              <ThemedText type="defaultSemiBold">{t('reports.range.startDate')}</ThemedText>
              <DatePickerField accessibilityLabel={t('reports.range.startDate')} value={reportStartDate}
                onChange={setReportStartDate} displayFormat="full" />
              <ThemedText type="defaultSemiBold">{t('reports.range.endDate')}</ThemedText>
              <DatePickerField accessibilityLabel={t('reports.range.endDate')} value={reportEndDate}
                onChange={setReportEndDate} minimumDate={null} displayFormat="full" />
              <Button title={t('vetVisits.openHealthReport')} variant="secondary"
                onPress={() => router.push({
                  pathname: '/reports', params: { startDate: reportStartDate, endDate: reportEndDate },
                })} />
            </>
          ) : null}
        </GroupedSection>
        <GroupedSection title={t('vetVisits.questions')} cardStyle={styles.formCard}>
          <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.caption}>
            {t('vetVisits.questionsHint')}
          </ThemedText>
          {questions.map((question, index) => (
            <VetVisitQuestionEditor key={question.id} index={index} value={question.text}
              canMoveUp={index > 0} canMoveDown={index < questions.length - 1}
              onChange={(value) => updateQuestion(index, value)}
              onMoveUp={() => moveQuestion(index, -1)} onMoveDown={() => moveQuestion(index, 1)}
              onRemove={() => setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index))} />
          ))}
          <Button title={t('vetVisits.addQuestion')} variant="secondary" onPress={() =>
            setQuestions((current) => [...current, {
              id: createVetVisitId(), text: '', createdAt: new Date().toISOString(),
            }])} />
        </GroupedSection>
        {error ? <ThemedText accessibilityRole="alert" style={styles.error}>{error}</ThemedText> : null}
        {existing?.visit.status === 'planned' ? (
          <Button title={t('vetVisits.startVisit')} disabled={saving}
            onPress={() => void persistVisit(true)} />
        ) : null}
        {existing?.visit.status === 'in_progress' ? (
          <Button title={t('vetVisits.continueVisit')}
            onPress={() => router.push(`/vet-visits/live/${existing.visit.id}` as Href)} />
        ) : null}
        {existing ? <Button title={t('common.delete')} variant="destructive" disabled={saving} onPress={handleDelete} /> : null}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.lg, paddingBottom: Spacing.xl },
  formCard: { padding: Spacing.md, gap: Spacing.md },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  switchCopy: { flex: 1, gap: 2 },
  error: { color: '#ef4444' },
});
