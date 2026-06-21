import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { ReportCheckboxRow } from '@/components/reports/ReportCheckboxRow';
import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { CHECK_IN_CATEGORIES } from '@/constants/check-in';
import { RECORD_TYPES } from '@/constants/record-types';
import {
  createDefaultReportDataSelection,
  hasAnyReportDataSelection,
  REPORT_CHECK_IN_DATA_KEYS,
  REPORT_RECORD_DATA_KEYS,
  REPORT_RANGE_PRESETS,
} from '@/constants/reports';
import { Spacing, Typography } from '@/constants/theme';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { buildReportPreviewContent } from '@/services/reports/build-report-preview';
import { exportReportPdf } from '@/services/reports/export-report-pdf';
import { generateReportHtml } from '@/services/reports/generate-report-html';
import * as checkInStorage from '@/storage/check-in.storage';
import * as petRecordStorage from '@/storage/pet-record.storage';
import { usePetStore } from '@/stores/pet.store';
import type {
  ReportCheckInDataKey,
  ReportDataSelection,
  ReportDateRange,
  ReportPreviewContent,
  ReportRangePreset,
  ReportRecordDataKey,
  ReportWizardStep,
} from '@/types/report';
import { formatCheckInTitleDate } from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';
import { getPresetDateRange, isReportDateRangeValid, resolveReportDateRange } from '@/utils/report-range';

const WIZARD_STEPS: ReportWizardStep[] = ['range', 'data', 'preview'];

function getStepIndex(step: ReportWizardStep): number {
  return WIZARD_STEPS.indexOf(step);
}

export function ReportsWizardContent() {
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);
  const { displayPetSpecies, displayPetBreed, displayPetAgeGroup } = usePetDisplay();

  const pet = usePetStore((state) => state.pet);
  const loadPet = usePetStore((state) => state.loadPet);

  const [step, setStep] = useState<ReportWizardStep>('range');
  const [range, setRange] = useState<ReportDateRange>(() => ({
    preset: '30d',
    ...getPresetDateRange('30d'),
  }));
  const [selection, setSelection] = useState<ReportDataSelection>(createDefaultReportDataSelection);
  const [previewContent, setPreviewContent] = useState<ReportPreviewContent | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  const formatDate = useCallback(
    (date: string) => formatCheckInTitleDate(date, locale),
    [locale]
  );

  const resolvedRangeLabel = useMemo(() => {
    const resolved = resolveReportDateRange(range);
    return `${formatDate(resolved.startDate)} – ${formatDate(resolved.endDate)}`;
  }, [formatDate, range]);

  const handlePresetChange = (preset: ReportRangePreset) => {
    setValidationError(null);

    if (preset === 'custom') {
      setRange((current) => ({
        preset: 'custom',
        startDate: current.startDate,
        endDate: current.endDate,
      }));
      return;
    }

    setRange({
      preset,
      ...getPresetDateRange(preset),
    });
  };

  const toggleCheckInSelection = (key: ReportCheckInDataKey) => {
    setValidationError(null);
    setSelection((current) => ({
      ...current,
      checkIn: {
        ...current.checkIn,
        [key]: !current.checkIn[key],
      },
    }));
  };

  const toggleRecordSelection = (key: ReportRecordDataKey) => {
    setValidationError(null);
    setSelection((current) => ({
      ...current,
      records: {
        ...current.records,
        [key]: !current.records[key],
      },
    }));
  };

  const loadPreview = useCallback(async () => {
    if (!pet?.id) {
      return;
    }

    setIsLoadingPreview(true);
    setValidationError(null);

    try {
      const [checkIns, records] = await Promise.all([
        checkInStorage.getCheckInsByPetId(pet.id),
        petRecordStorage.getPetRecordsByPetId(pet.id),
      ]);

      const content = buildReportPreviewContent({
        range,
        selection,
        checkIns,
        records,
        t,
      });

      setPreviewContent(content);
    } catch {
      setValidationError(t('reports.exportFailed'));
      setPreviewContent(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [pet?.id, range, selection, t]);

  useEffect(() => {
    if (step === 'preview') {
      void loadPreview();
    }
  }, [loadPreview, step]);

  const handleNext = () => {
    setValidationError(null);

    if (step === 'range') {
      if (!isReportDateRangeValid(range)) {
        setValidationError(t('reports.validation.invalidRange'));
        return;
      }

      setStep('data');
      return;
    }

    if (step === 'data') {
      if (!hasAnyReportDataSelection(selection)) {
        setValidationError(t('reports.validation.noDataSelected'));
        return;
      }

      setStep('preview');
    }
  };

  const handleBack = () => {
    setValidationError(null);

    if (step === 'data') {
      setStep('range');
      return;
    }

    if (step === 'preview') {
      setStep('data');
    }
  };

  const handleExportPdf = async () => {
    if (!pet || !previewContent) {
      return;
    }

    setIsExporting(true);
    setValidationError(null);

    try {
      const html = generateReportHtml({
        pet: {
          name: pet.name,
          species: displayPetSpecies(pet.species),
          breed: displayPetBreed(pet.breed),
          ageGroup: displayPetAgeGroup(pet.ageGroup),
        },
        content: previewContent,
        formatDate,
        labels: {
          title: t('reports.pdf.title'),
          generatedFor: t('reports.pdf.generatedFor'),
          dateRange: t('reports.pdf.dateRange'),
          species: t('pet.sections.petType'),
          breed: t('pet.fields.breed'),
          ageGroup: t('pet.fields.ageGroup'),
          checkInsSection: t('reports.preview.checkInsSection'),
          recordsSection: t('reports.preview.recordsSection'),
          notes: t('records.fields.notes'),
          empty: t('reports.preview.empty'),
        },
      });

      await exportReportPdf(html);
    } catch {
      setValidationError(t('reports.exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  if (!pet) {
    return (
      <ScreenContainer edges={['bottom']} contentStyle={styles.centered}>
        <ThemedText style={styles.message}>{t('reports.noPet')}</ThemedText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.stepLabel}>
        {t('reports.steps.label', {
          current: getStepIndex(step) + 1,
          total: WIZARD_STEPS.length,
        })}
      </ThemedText>

      {step === 'range' ? (
        <>
          <ThemedText type="subtitle">{t('reports.steps.rangeTitle')}</ThemedText>
          <GroupedSection title={t('reports.range.sectionTitle')}>
            <View style={styles.sectionBody}>
              {REPORT_RANGE_PRESETS.map((preset) => (
                <SelectableOption
                  key={preset}
                  label={t(`reports.range.presets.${preset}`)}
                  selected={range.preset === preset}
                  onPress={() => handlePresetChange(preset)}
                />
              ))}
            </View>
          </GroupedSection>

          {range.preset === 'custom' ? (
            <GroupedSection title={t('reports.range.customTitle')}>
              <View style={styles.sectionBody}>
                <View style={styles.field}>
                  <ThemedText type="defaultSemiBold">{t('reports.range.startDate')}</ThemedText>
                  <DatePickerField
                    accessibilityLabel={t('reports.range.startDate')}
                    placeholder={t('records.fields.datePlaceholder')}
                    value={range.startDate}
                    onChange={(startDate) => {
                      setValidationError(null);
                      setRange((current) => ({ ...current, startDate }));
                    }}
                  />
                </View>
                <View style={styles.field}>
                  <ThemedText type="defaultSemiBold">{t('reports.range.endDate')}</ThemedText>
                  <DatePickerField
                    accessibilityLabel={t('reports.range.endDate')}
                    placeholder={t('records.fields.datePlaceholder')}
                    value={range.endDate}
                    onChange={(endDate) => {
                      setValidationError(null);
                      setRange((current) => ({ ...current, endDate }));
                    }}
                  />
                </View>
              </View>
            </GroupedSection>
          ) : (
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.rangeHint}>
              {resolvedRangeLabel}
            </ThemedText>
          )}
        </>
      ) : null}

      {step === 'data' ? (
        <>
          <ThemedText type="subtitle">{t('reports.steps.dataTitle')}</ThemedText>
          <GroupedSection title={t('reports.data.checkInsSection')}>
            {REPORT_CHECK_IN_DATA_KEYS.map((key, index) => {
              const label =
                key === 'notes'
                  ? t('records.fields.notes')
                  : t(
                      CHECK_IN_CATEGORIES.find((category) => category.key === key)?.translationKey ??
                        key
                    );

              return (
                <ReportCheckboxRow
                  key={key}
                  label={label}
                  selected={selection.checkIn[key]}
                  isLast={index === REPORT_CHECK_IN_DATA_KEYS.length - 1}
                  onPress={() => toggleCheckInSelection(key)}
                />
              );
            })}
          </GroupedSection>

          <GroupedSection title={t('reports.data.recordsSection')}>
            {REPORT_RECORD_DATA_KEYS.map((key, index) => {
              const definition = RECORD_TYPES.find((type) => type.id === key);

              return (
                <ReportCheckboxRow
                  key={key}
                  label={definition ? t(definition.labelKey) : key}
                  selected={selection.records[key]}
                  isLast={index === REPORT_RECORD_DATA_KEYS.length - 1}
                  onPress={() => toggleRecordSelection(key)}
                />
              );
            })}
          </GroupedSection>
        </>
      ) : null}

      {step === 'preview' ? (
        <>
          <ThemedText type="subtitle">{t('reports.steps.previewTitle')}</ThemedText>
          {isLoadingPreview ? (
            <View style={styles.centered}>
              <ActivityIndicator color={primaryColor} size="large" />
            </View>
          ) : previewContent ? (
            <>
              <GroupedSection title={t('reports.preview.petSection')}>
                <View style={styles.previewBody}>
                  <ThemedText type="defaultSemiBold">{pet.name}</ThemedText>
                  <ThemedText
                    lightColor={textSecondaryColor}
                    darkColor={textSecondaryColor}
                    style={styles.previewMeta}>
                    {displayPetSpecies(pet.species)} · {displayPetBreed(pet.breed)}
                  </ThemedText>
                  <ThemedText
                    lightColor={textSecondaryColor}
                    darkColor={textSecondaryColor}
                    style={styles.previewMeta}>
                    {resolvedRangeLabel}
                  </ThemedText>
                </View>
              </GroupedSection>

              {previewContent.isEmpty ? (
                <ThemedText
                  lightColor={textSecondaryColor}
                  darkColor={textSecondaryColor}
                  style={styles.empty}>
                  {t('reports.preview.empty')}
                </ThemedText>
              ) : (
                <>
                  {previewContent.checkIns.length > 0 ? (
                    <GroupedSection title={t('reports.preview.checkInsSection')}>
                      <View style={styles.previewBody}>
                        {previewContent.checkIns.map((entry) => (
                          <View key={entry.date} style={styles.previewEntry}>
                            <ThemedText type="defaultSemiBold">{formatDate(entry.date)}</ThemedText>
                            {entry.fields.map((field) => (
                              <ThemedText key={`${entry.date}-${field.label}`} style={styles.previewLine}>
                                {field.label}: {field.value}
                              </ThemedText>
                            ))}
                            {entry.notes ? (
                              <ThemedText
                                lightColor={textSecondaryColor}
                                darkColor={textSecondaryColor}
                                style={styles.previewNotes}>
                                {t('records.fields.notes')}: {entry.notes}
                              </ThemedText>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    </GroupedSection>
                  ) : null}

                  {previewContent.records.length > 0 ? (
                    <GroupedSection title={t('reports.preview.recordsSection')}>
                      <View style={styles.previewBody}>
                        {previewContent.records.map((entry, index) => (
                          <View key={`${entry.date}-${entry.typeLabel}-${index}`} style={styles.previewEntry}>
                            <ThemedText type="defaultSemiBold">
                              {formatDate(entry.date)} · {entry.typeLabel}
                            </ThemedText>
                            <ThemedText style={styles.previewLine}>{entry.detail}</ThemedText>
                            {entry.notes ? (
                              <ThemedText
                                lightColor={textSecondaryColor}
                                darkColor={textSecondaryColor}
                                style={styles.previewNotes}>
                                {t('records.fields.notes')}: {entry.notes}
                              </ThemedText>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    </GroupedSection>
                  ) : null}
                </>
              )}

              <Button
                title={t('reports.exportPdf')}
                disabled={isExporting || previewContent.isEmpty}
                onPress={() => void handleExportPdf()}
              />
            </>
          ) : null}
        </>
      ) : null}

      {validationError ? (
        <ThemedText lightColor={primaryColor} darkColor={primaryColor} style={styles.error}>
          {validationError}
        </ThemedText>
      ) : null}

      {step !== 'preview' ? (
        <View style={styles.actions}>
          {step !== 'range' ? (
            <Button title={t('reports.back')} variant="secondary" onPress={handleBack} style={styles.actionButton} />
          ) : null}
          <Button title={t('reports.next')} onPress={handleNext} style={styles.actionButton} />
        </View>
      ) : (
        <Button title={t('reports.back')} variant="secondary" onPress={handleBack} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  stepLabel: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: Spacing.xs,
  },
  sectionBody: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  field: {
    gap: Spacing.xs,
  },
  rangeHint: {
    ...Typography.body,
    paddingHorizontal: Spacing.xs,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
  },
  previewBody: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  previewMeta: {
    ...Typography.body,
  },
  previewEntry: {
    gap: Spacing.xs,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(127,127,127,0.25)',
  },
  previewLine: {
    ...Typography.body,
  },
  previewNotes: {
    ...Typography.caption,
  },
  empty: {
    ...Typography.body,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  error: {
    ...Typography.body,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
