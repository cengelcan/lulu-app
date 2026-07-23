import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { ReportCheckboxRow } from '@/components/reports/ReportCheckboxRow';
import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ContentState } from '@/components/ui/content-state';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { LayoutTokens } from '@/constants/layout';
import { REPORT_RANGE_PRESETS } from '@/constants/reports';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { buildVisitBrief } from '@/services/vet-visits/build-visit-brief';
import * as checkInStorage from '@/storage/check-in.storage';
import * as medicationStorage from '@/storage/medication.storage';
import * as petRecordStorage from '@/storage/pet-record.storage';
import { usePetStore } from '@/stores/pet.store';
import type { ReportDateRange, ReportRangePreset } from '@/types/report';
import {
  DEFAULT_VISIT_BRIEF_SELECTION,
  type VisitBrief,
  type VisitBriefSection,
} from '@/types/vet-visit';
import { formatCheckInTitleDate } from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';
import { canViewReports } from '@/utils/pet-access';
import {
  getPresetDateRange,
  isReportDateRangeValid,
  resolveReportDateRange,
} from '@/utils/report-range';

const QUESTION_LIMIT = 1000;

export function VetVisitBriefScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);
  const pet = usePetStore((state) => state.pet);
  const isPetLoading = usePetStore((state) => state.isLoading);
  const loadPet = usePetStore((state) => state.loadPet);
  const [range, setRange] = useState<ReportDateRange>(() => ({
    preset: '30d',
    ...getPresetDateRange('30d'),
  }));
  const [selection, setSelection] = useState(DEFAULT_VISIT_BRIEF_SELECTION);
  const [questionText, setQuestionText] = useState('');
  const [brief, setBrief] = useState<VisitBrief | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const alertColor = useThemeColor({}, 'alert');
  const successColor = useThemeColor({}, 'success');

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  useEffect(() => {
    if (pet && !canViewReports(pet)) {
      router.replace('/(tabs)/care');
    }
  }, [pet, router]);

  const resolvedRangeLabel = useMemo(() => {
    const resolved = resolveReportDateRange(range);
    return `${formatCheckInTitleDate(resolved.startDate, locale)} – ${formatCheckInTitleDate(
      resolved.endDate,
      locale
    )}`;
  }, [locale, range]);

  const presetLabel = (preset: ReportRangePreset) => {
    if (preset === '7d') return t('reports.range.presets.7d');
    if (preset === '30d') return t('reports.range.presets.30d');
    if (preset === '90d') return t('reports.range.presets.90d');
    return t('reports.range.presets.custom');
  };

  const handlePresetChange = (preset: ReportRangePreset) => {
    setError(null);
    if (preset === 'custom') {
      setRange((current) => ({ ...current, preset }));
      return;
    }
    setRange({ preset, ...getPresetDateRange(preset) });
  };

  const toggleSection = (section: VisitBriefSection) => {
    setError(null);
    setSelection((current) => ({ ...current, [section]: !current[section] }));
  };

  const buildBrief = async () => {
    if (!pet?.id) return;
    if (!isReportDateRangeValid(range)) {
      setError(t('reports.validation.invalidRange'));
      return;
    }
    if (!Object.values(selection).some(Boolean) && !questionText.trim()) {
      setError(t('reports.validation.noDataSelected'));
      return;
    }

    setIsBuilding(true);
    setError(null);
    try {
      const [checkIns, records, medicationPlans] = await Promise.all([
        checkInStorage.getCheckInsByPetId(pet.id),
        petRecordStorage.getPetRecordsByPetId(pet.id),
        medicationStorage.getMedicationPlansByPetId(pet.id),
      ]);
      setBrief(
        buildVisitBrief({
          range,
          selection,
          checkIns,
          records,
          medicationPlans,
          questions: questionText.split('\n'),
          t,
        })
      );
    } catch {
      setError(t('errors.unknown'));
    } finally {
      setIsBuilding(false);
    }
  };

  if (isPetLoading && !pet) {
    return (
      <ScreenContent>
        <ContentState kind="loading" accessibilityLabel={t('vetVisit.loading')} />
      </ScreenContent>
    );
  }

  if (!pet || !canViewReports(pet)) return null;

  if (brief) {
    return (
      <ScreenContent>
        <View style={styles.intro}>
          <ThemedText accessibilityRole="header" style={styles.title}>
            {pet.name}
          </ThemedText>
          <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor}>
            {resolvedRangeLabel}
          </ThemedText>
        </View>

        {brief.isEmpty ? (
          <ContentState
            kind="empty"
            presentation="card"
            title={t('vetVisit.noDataTitle')}
            message={t('vetVisit.noDataDescription')}
          />
        ) : (
          <>
            {brief.items.length > 0 ? (
              <GroupedSection title={t('vetVisit.highlightsTitle')}>
                {brief.items.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.briefRow,
                      index < brief.items.length - 1 && {
                        borderBottomColor: borderColor,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      },
                    ]}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            item.tone === 'alert'
                              ? alertColor
                              : item.tone === 'normal'
                                ? successColor
                                : textSecondaryColor,
                        },
                      ]}
                    />
                    <ThemedText style={styles.rowText}>{item.text}</ThemedText>
                  </View>
                ))}
              </GroupedSection>
            ) : null}

            {brief.questions.length > 0 ? (
              <GroupedSection title={t('vetVisit.questionsTitle')}>
                {brief.questions.map((question, index) => (
                  <View
                    key={`${question}-${index}`}
                    style={[
                      styles.briefRow,
                      index < brief.questions.length - 1 && {
                        borderBottomColor: borderColor,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      },
                    ]}>
                    <ThemedText style={styles.questionNumber}>{index + 1}</ThemedText>
                    <ThemedText style={styles.rowText}>{question}</ThemedText>
                  </View>
                ))}
              </GroupedSection>
            ) : null}

            {brief.sources.length > 0 ? (
              <GroupedSection title={t('vetVisit.sourcesTitle')}>
                {brief.sources.map((source, index) => (
                  <Pressable
                    key={source.id}
                    accessibilityRole="button"
                    onPress={() => router.push(source.route)}
                    style={({ pressed }) => [
                      styles.sourceRow,
                      index < brief.sources.length - 1 && {
                        borderBottomColor: borderColor,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      },
                      { opacity: pressed ? 0.7 : 1 },
                    ]}>
                    <View style={styles.sourceCopy}>
                      <ThemedText type="defaultSemiBold">{source.label}</ThemedText>
                      <ThemedText
                        lightColor={textSecondaryColor}
                        darkColor={textSecondaryColor}
                        style={styles.sourceDate}>
                        {formatCheckInTitleDate(source.date, locale)}
                      </ThemedText>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
                  </Pressable>
                ))}
              </GroupedSection>
            ) : null}
          </>
        )}

        <Card>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.disclaimer}>
            {t('vetVisit.disclaimer')}
          </ThemedText>
        </Card>
        <Button title={t('vetVisit.editBrief')} variant="secondary" onPress={() => setBrief(null)} />
      </ScreenContent>
    );
  }

  return (
    <ScreenContent>
      <View style={styles.intro}>
        <ThemedText accessibilityRole="header" style={styles.title}>
          {t('vetVisit.title')}
        </ThemedText>
        <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor}>
          {t('vetVisit.intro')}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="defaultSemiBold">{t('vetVisit.rangeTitle')}</ThemedText>
        <View style={styles.options}>
          {REPORT_RANGE_PRESETS.map((preset) => (
            <SelectableOption
              key={preset}
              label={presetLabel(preset)}
              selected={range.preset === preset}
              onPress={() => handlePresetChange(preset)}
            />
          ))}
        </View>
        {range.preset === 'custom' ? (
          <View style={styles.customRange}>
            <View style={styles.dateField}>
              <ThemedText style={styles.fieldLabel}>{t('reports.range.startDate')}</ThemedText>
              <DatePickerField
                accessibilityLabel={t('reports.range.startDate')}
                value={range.startDate}
                onChange={(startDate) => setRange((current) => ({ ...current, startDate }))}
              />
            </View>
            <View style={styles.dateField}>
              <ThemedText style={styles.fieldLabel}>{t('reports.range.endDate')}</ThemedText>
              <DatePickerField
                accessibilityLabel={t('reports.range.endDate')}
                value={range.endDate}
                onChange={(endDate) => setRange((current) => ({ ...current, endDate }))}
              />
            </View>
          </View>
        ) : null}
      </View>

      <GroupedSection title={t('vetVisit.sectionsTitle')}>
        <ReportCheckboxRow
          label={t('vetVisit.checkIns')}
          selected={selection.checkIns}
          onPress={() => toggleSection('checkIns')}
        />
        <ReportCheckboxRow
          label={t('vetVisit.medications')}
          selected={selection.medications}
          onPress={() => toggleSection('medications')}
        />
        <ReportCheckboxRow
          label={t('vetVisit.records')}
          selected={selection.records}
          isLast
          onPress={() => toggleSection('records')}
        />
      </GroupedSection>

      <View style={styles.section}>
        <ThemedText type="defaultSemiBold">{t('vetVisit.questionsTitle')}</ThemedText>
        <TextInput
          accessibilityLabel={t('vetVisit.questionsTitle')}
          maxLength={QUESTION_LIMIT}
          multiline
          onChangeText={setQuestionText}
          placeholder={t('vetVisit.questionsPlaceholder')}
          placeholderTextColor={textSecondaryColor}
          style={[
            styles.input,
            { backgroundColor: surfaceColor, borderColor, color: textColor },
          ]}
          textAlignVertical="top"
          value={questionText}
        />
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.hint}>
          {t('vetVisit.questionsHint')}
        </ThemedText>
      </View>

      {error ? (
        <ThemedText
          accessibilityLiveRegion="assertive"
          lightColor={alertColor}
          darkColor={alertColor}
          style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
      <Button
        title={t('vetVisit.buildBrief')}
        disabled={isBuilding}
        onPress={() => void buildBrief()}
      />
    </ScreenContent>
  );
}

function ScreenContent({ children }: { children: React.ReactNode }) {
  return (
    <ScreenContainer
      scrollable
      edges={['bottom']}
      maxContentWidth={LayoutTokens.readingContentMaxWidth}
      contentStyle={styles.content}>
      {children}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.xl },
  intro: { gap: Spacing.xs },
  title: { ...Typography.title },
  section: { gap: Spacing.sm },
  options: { gap: Spacing.xs },
  customRange: { gap: Spacing.sm },
  dateField: { gap: Spacing.xs },
  fieldLabel: { ...Typography.caption },
  input: {
    ...Typography.body,
    minHeight: 128,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  hint: { ...Typography.caption },
  error: { ...Typography.caption },
  briefRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: Radius.full, flexShrink: 0 },
  rowText: { ...Typography.body, flex: 1 },
  questionNumber: {
    ...Typography.caption,
    width: 24,
    height: 24,
    lineHeight: 24,
    textAlign: 'center',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  sourceRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sourceCopy: { flex: 1, minWidth: 0, gap: 2 },
  sourceDate: { ...Typography.caption },
  disclaimer: { ...Typography.caption, textAlign: 'center' },
});
