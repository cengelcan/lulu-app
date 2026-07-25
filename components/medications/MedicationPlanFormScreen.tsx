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
import { Spacing, Typography } from '@/constants/theme';
import { useHubStackScreenOptions } from '@/hooks/use-hub-stack-screen-options';
import { usePlusFeature } from '@/hooks/use-plus-feature';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { linkFollowUpToVetVisit } from '@/services/vet-visits/link-follow-up';
import * as medicationStorage from '@/storage/medication.storage';
import * as vetVisitStorage from '@/storage/vet-visit.storage';
import { useMedicationStore } from '@/stores/medication.store';
import { usePetStore } from '@/stores/pet.store';
import type { MedicationPlanBundle } from '@/types/medication';
import { formatLocalDate, getTodayStart } from '@/utils/date';

function createId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function MedicationPlanFormScreen() {
  const { id, sourceVisitId } = useLocalSearchParams<{ id: string; sourceVisitId?: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const pet = usePetStore((state) => state.pet);
  const savePlan = useMedicationStore((state) => state.savePlan);
  const [existing, setExisting] = useState<MedicationPlanBundle | null>(null);
  const [name, setName] = useState('');
  const [form, setForm] = useState('');
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState('');
  const [instructions, setInstructions] = useState('');
  const [startsOn, setStartsOn] = useState(() => formatLocalDate(getTodayStart()));
  const [endsOn, setEndsOn] = useState('');
  const [time, setTime] = useState({ hour: 9, minute: 0 });
  const [isPrn, setIsPrn] = useState(false);
  const [remainingDoses, setRemainingDoses] = useState('');
  const [refillThreshold, setRefillThreshold] = useState('3');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const secondary = useThemeColor({}, 'textSecondary');
  const isNew = id === 'new';
  const title = isNew ? t('medications.addPlan') : t('medications.editPlan');
  const screenOptions = useHubStackScreenOptions(title, '/medications' as Href);
  const { allowed: canUseInventory, requestAccess } = usePlusFeature('medicationInventory');

  useEffect(() => {
    if (isNew || !id) return;
    let cancelled = false;
    void medicationStorage.getMedicationBundle(id).then((bundle) => {
      if (cancelled || !bundle) return;
      setExisting(bundle); setName(bundle.plan.name); setForm(bundle.plan.form ?? '');
      setDosage(bundle.plan.dosage); setUnit(bundle.plan.unit);
      setInstructions(bundle.plan.instructions ?? ''); setStartsOn(bundle.plan.startsOn);
      setEndsOn(bundle.plan.endsOn ?? ''); setIsPrn(bundle.plan.isPrn);
      if (bundle.inventory) {
        setRemainingDoses(String(bundle.inventory.remainingDoses));
        setRefillThreshold(String(bundle.inventory.refillThreshold));
      }
      if (bundle.schedules[0]?.times[0]) setTime(bundle.schedules[0].times[0]);
    });
    return () => { cancelled = true; };
  }, [id, isNew]);

  useEffect(() => {
    if (!isNew || !sourceVisitId) return;
    let cancelled = false;
    void vetVisitStorage.getVetVisitBundle(sourceVisitId).then((bundle) => {
      if (!bundle || cancelled) return;
      setInstructions(bundle.outcome?.treatmentNotes ?? '');
      setStartsOn(formatLocalDate(new Date(bundle.visit.completedAt ?? Date.now())));
    });
    return () => { cancelled = true; };
  }, [isNew, sourceVisitId]);

  const validationError = useMemo(() => {
    if (!name.trim()) return t('medications.validation.nameRequired');
    if (!dosage.trim()) return t('medications.validation.dosageRequired');
    if (!unit.trim()) return t('medications.validation.unitRequired');
    if (endsOn && endsOn < startsOn) return t('medications.validation.dateRange');
    return null;
  }, [dosage, endsOn, name, startsOn, t, unit]);

  const handleSave = async (
    status: 'active' | 'completed' | 'archived' = existing?.plan.status ?? 'active'
  ) => {
    if (!pet?.id || validationError) { setError(validationError); return; }
    setSaving(true); setError(null);
    const now = new Date().toISOString();
    const planId = existing?.plan.id ?? createId();
    const scheduleId = existing?.schedules[0]?.id ?? createId();
    try {
      const parsedRemaining = Number.parseInt(remainingDoses, 10);
      const parsedThreshold = Number.parseInt(refillThreshold, 10);
      await savePlan({
        plan: {
          id: planId, petId: pet.id, name: name.trim(), form: form.trim() || null,
          dosage: dosage.trim(), unit: unit.trim(), instructions: instructions.trim() || null,
          startsOn, endsOn: endsOn || null,
          timezone: existing?.plan.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
          isPrn, status, createdAt: existing?.plan.createdAt ?? now, updatedAt: now,
        },
        schedules: isPrn ? [] : [{
          id: scheduleId, planId, frequency: 'daily', interval: 1, weekdays: [], times: [time],
          effectiveFrom: startsOn, effectiveTo: endsOn || null,
          createdAt: existing?.schedules[0]?.createdAt ?? now, updatedAt: now,
        }],
        inventory: canUseInventory && Number.isFinite(parsedRemaining) ? {
          planId, petId: pet.id, remainingDoses: Math.max(0, parsedRemaining),
          refillThreshold: Number.isFinite(parsedThreshold) ? Math.max(0, parsedThreshold) : 3,
          updatedAt: now,
        } : existing?.inventory ?? null,
      });
      if (sourceVisitId) {
        await linkFollowUpToVetVisit(sourceVisitId, 'medication', planId);
        router.replace(`/vet-visits/outcome/${sourceVisitId}` as Href);
      } else {
        router.replace('/medications' as Href);
      }
    } catch { setError(t('medications.saveFailed')); }
    finally { setSaving(false); }
  };

  const handleArchive = () => Alert.alert(t('medications.archiveTitle'), t('medications.archiveMessage'), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('medications.archive'), style: 'destructive', onPress: () => void handleSave('completed') },
  ]);

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        <GroupedSection title={t('medications.description')} cardStyle={styles.formCard}>
          <RecordTextField label={t('medications.fields.name')} value={name} onChangeText={setName}
            placeholder={t('medications.fields.namePlaceholder')} />
          <RecordTextField label={t('medications.fields.form')} value={form} onChangeText={setForm}
            placeholder={t('medications.fields.formPlaceholder')} optional />
          <RecordTextField label={t('medications.fields.dosage')} value={dosage} onChangeText={setDosage}
            placeholder={t('medications.fields.dosagePlaceholder')} />
          <RecordTextField label={t('medications.fields.unit')} value={unit} onChangeText={setUnit}
            placeholder={t('medications.fields.unitPlaceholder')} />
          <RecordTextField label={t('medications.fields.instructions')} value={instructions}
            onChangeText={setInstructions} placeholder={t('medications.fields.instructionsPlaceholder')}
            optional multiline />
        </GroupedSection>
        <GroupedSection title={t('medications.inventory.title')} cardStyle={styles.formCard}>
          {canUseInventory ? (
            <>
              <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.caption}>
                {t('medications.inventory.description')}
              </ThemedText>
              <RecordTextField label={t('medications.inventory.remaining')} value={remainingDoses}
                onChangeText={setRemainingDoses} placeholder="0" keyboardType="number-pad" optional />
              <RecordTextField label={t('medications.inventory.threshold')} value={refillThreshold}
                onChangeText={setRefillThreshold} placeholder="3" keyboardType="number-pad" />
            </>
          ) : (
            <>
              <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.body}>
                {t('medications.inventory.plusDescription')}
              </ThemedText>
              <Button title={t('medications.inventory.unlock')} variant="secondary" onPress={requestAccess} />
            </>
          )}
        </GroupedSection>
        <GroupedSection title={t('medications.fields.startsOn')} cardStyle={styles.formCard}>
          <DatePickerField accessibilityLabel={t('medications.fields.startsOn')} value={startsOn}
            onChange={setStartsOn} maximumDate={null} displayFormat="full" />
          <ThemedText type="defaultSemiBold">{t('medications.fields.endsOn')}</ThemedText>
          <DatePickerField accessibilityLabel={t('medications.fields.endsOn')} value={endsOn}
            onChange={setEndsOn} minimumDate={getTodayStart()} maximumDate={null} displayFormat="full" />
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <ThemedText type="defaultSemiBold">{t('medications.fields.prn')}</ThemedText>
              <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.caption}>
                {t('medications.fields.prnDescription')}
              </ThemedText>
            </View>
            <Switch accessibilityLabel={t('medications.fields.prn')} value={isPrn} onValueChange={setIsPrn} />
          </View>
          {!isPrn ? <TimePickerField accessibilityLabel={t('medications.fields.time')}
            label={t('medications.fields.time')} value={time} onChange={setTime} variant="row" isLast /> : null}
        </GroupedSection>
        {error ? <ThemedText accessibilityRole="alert" style={styles.error} selectable>{error}</ThemedText> : null}
        <Button title={t('medications.save')} disabled={saving} onPress={() => void handleSave()} />
        {existing?.plan.status === 'active' ? <Button title={t('medications.archive')}
          variant="destructive" disabled={saving} onPress={handleArchive} /> : null}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.lg },
  formCard: { padding: Spacing.md, gap: Spacing.md },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  switchCopy: { flex: 1, gap: 2 },
  error: { color: '#ef4444' },
});
