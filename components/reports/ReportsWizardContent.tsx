import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { LuluPlusPaywall } from '@/components/paywall/LuluPlusPaywall';
import { ReportCheckboxRow } from '@/components/reports/ReportCheckboxRow';
import { ReportDocumentPreview } from '@/components/reports/ReportDocumentPreview';
import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { PlusLockButtonIcon } from '@/components/ui/PlusLockIcon';
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
import { usePlusFeature } from '@/hooks/use-plus-feature';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { translateError } from '@/utils/translate-error';
import { buildReportPreviewContent } from '@/services/reports/build-report-preview';
import { buildReportSummary } from '@/services/reports/build-report-summary';
import { exportReportPdf } from '@/services/reports/export-report-pdf';
import { generateReportHtml } from '@/services/reports/generate-report-html';
import * as checkInStorage from '@/storage/check-in.storage';
import * as petRecordStorage from '@/storage/pet-record.storage';
import { usePetStore } from '@/stores/pet.store';
import { canViewReports } from '@/utils/pet-access';
import type {
  ReportCheckInDataKey,
  ReportDataSelection,
  ReportDateRange,
  ReportDocumentLabels,
  ReportPetSummary,
  ReportPreviewContent,
  ReportRangePreset,
  ReportRecordDataKey,
  ReportShellLabels,
  ReportSummary,
  ReportWizardStep,
} from '@/types/report';
import { formatCheckInTitleDate } from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';
import { buildReportPetSummary } from '@/utils/report-pet-summary';
import { resolveReportExportAssets, type ReportExportAssets } from '@/utils/report-export-assets';
import { getPresetDateRange, isReportDateRangeValid, resolveReportDateRange } from '@/utils/report-range';

const WIZARD_STEPS: ReportWizardStep[] = ['range', 'data', 'review'];

function getStepIndex(step: ReportWizardStep): number {
  return WIZARD_STEPS.indexOf(step);
}

export function ReportsWizardContent() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);
  const petDisplay = usePetDisplay();

  const pet = usePetStore((state) => state.pet);
  const loadPet = usePetStore((state) => state.loadPet);

  const [step, setStep] = useState<ReportWizardStep>('range');
  const [range, setRange] = useState<ReportDateRange>(() => ({
    preset: '30d',
    ...getPresetDateRange('30d'),
  }));
  const [selection, setSelection] = useState<ReportDataSelection>(createDefaultReportDataSelection);
  const [petSummary, setPetSummary] = useState<ReportPetSummary | null>(null);
  const [previewContent, setPreviewContent] = useState<ReportPreviewContent | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [exportAssets, setExportAssets] = useState<ReportExportAssets | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { allowed: canExportPdf, paywallVisible, requestAccess, dismissPaywall } =
    usePlusFeature('pdfExport');

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  useEffect(() => {
    if (pet && !canViewReports(pet)) {
      router.replace('/(tabs)/home');
    }
  }, [pet, router]);

  const formatDate = useCallback(
    (date: string) => formatCheckInTitleDate(date, locale),
    [locale]
  );

  const documentLabels = useMemo<ReportDocumentLabels>(
    () => ({
      dailyObservations: t('reports.review.dailyObservations'),
      recordsSection: t('reports.review.recordsSection'),
      notes: t('records.fields.notes'),
      empty: t('reports.review.empty'),
      owner: t('reports.petCard.owner'),
      microchip: t('reports.petCard.microchip'),
      species: t('pet.sections.petType'),
      sex: t('pet.fields.sex'),
      birthDate: t('pet.fields.birthDate'),
      sterilization: t('pet.fields.spayNeuter'),
      weight: t('records.types.weight'),
      dayStatusNormal: t('reports.review.dayStatusNormal'),
      dayStatusAlert: t('reports.review.dayStatusAlert'),
      summaryTitle: t('reports.review.summaryTitle'),
    }),
    [t]
  );

  const shellLabels = useMemo<ReportShellLabels>(
    () => ({
      pdfTitleSuffix: t('reports.pdfTitleSuffix'),
      qrCodeAlt: t('reports.qrCodeAlt'),
      appStoreBadgeAriaLabel: t('reports.review.appStoreBadge'),
      appStoreBadgeLine1: t('reports.appStoreBadgeLine1'),
      appStoreBadgeLine2: t('reports.appStoreBadgeLine2'),
    }),
    [t]
  );

  const resolvedRangeLabel = useMemo(() => {
    const resolved = resolveReportDateRange(range);
    return `${formatDate(resolved.startDate)} – ${formatDate(resolved.endDate)}`;
  }, [formatDate, range]);

  const generatedAtLabel = useMemo(() => {
    return new Date().toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [locale]);

  const formatPageLabel = useCallback(
    (current: number, total: number) => t('reports.review.pageOf', { current, total }),
    [t]
  );

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

  const loadReview = useCallback(async () => {
    if (!pet?.id) {
      return;
    }

    setIsLoadingReview(true);
    setValidationError(null);

    try {
      const [checkIns, records] = await Promise.all([
        checkInStorage.getCheckInsByPetId(pet.id),
        petRecordStorage.getPetRecordsByPetId(pet.id),
      ]);

      const nextPetSummary = buildReportPetSummary(pet, records, {
        ...petDisplay,
        t,
        locale,
      });

      setPetSummary(nextPetSummary);

      const content = buildReportPreviewContent({
        range,
        selection,
        checkIns,
        records,
        t,
        locale,
      });

      setPreviewContent(content);
      setSummary(buildReportSummary({ content, t }));
      setExportAssets(await resolveReportExportAssets(nextPetSummary.photoUri));
    } catch {
      setValidationError(t('reports.exportFailed'));
      setPreviewContent(null);
      setPetSummary(null);
      setSummary(null);
      setExportAssets(null);
    } finally {
      setIsLoadingReview(false);
    }
  }, [locale, pet, petDisplay, range, selection, t]);

  useEffect(() => {
    if (step === 'review') {
      void loadReview();
    }
  }, [loadReview, step]);

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

      setStep('review');
    }
  };

  const handleBack = () => {
    setValidationError(null);

    if (step === 'data') {
      setStep('range');
      return;
    }

    if (step === 'review') {
      setStep('data');
    }
  };

  const handleShareReport = async () => {
    if (!pet || !previewContent || !petSummary) {
      return;
    }

    if (!canExportPdf) {
      requestAccess();
      return;
    }

    setIsExporting(true);
    setValidationError(null);

    try {
      const { photoDataUri, qrCodeDataUri } =
        exportAssets ?? (await resolveReportExportAssets(petSummary.photoUri));
      const html = generateReportHtml({
        pet: petSummary,
        content: previewContent,
        labels: documentLabels,
        shellLabels,
        language,
        formatDate,
        generatedAtLabel,
        formatPageLabel,
        photoDataUri,
        qrCodeDataUri,
        primaryColor,
        summary,
      });

      const resolvedRange = resolveReportDateRange(range);
      const rangeFileLabel = `${formatDate(resolvedRange.startDate)} - ${formatDate(resolvedRange.endDate)}`;
      const fileName = `${petSummary.name} - ${t('reports.exportFileName')} (${rangeFileLabel})`;

      await exportReportPdf(html, {
        fileName,
        shareDialogTitle: t('reports.shareDialogTitle'),
        defaultFileName: t('reports.defaultFileName'),
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Report export failed:', error);
      }
      const storeErrorKey =
        error instanceof Error && error.message.startsWith('errors.') ? error.message : null;
      setValidationError(translateError(t, storeErrorKey) ?? t('reports.exportFailed'));
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

  if (step === 'review') {
    return (
      <View style={styles.reviewRoot}>
        <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.reviewContent}>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.stepLabel}>
            {t('reports.steps.label', {
              current: getStepIndex(step) + 1,
              total: WIZARD_STEPS.length,
            })}
          </ThemedText>
          <ThemedText type="subtitle">{t('reports.steps.reviewTitle')}</ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.reviewHint}>
            {t('reports.review.hint')}
          </ThemedText>

          {isLoadingReview ? (
            <View style={styles.centered}>
              <ActivityIndicator color={primaryColor} size="large" />
            </View>
          ) : previewContent && petSummary ? (
            <ReportDocumentPreview
              content={previewContent}
              formatDate={formatDate}
              formatPageLabel={formatPageLabel}
              generatedAtLabel={generatedAtLabel}
              labels={documentLabels}
              shellLabels={shellLabels}
              language={language}
              pet={petSummary}
              primaryColor={primaryColor}
              photoDataUri={exportAssets?.photoDataUri ?? null}
              qrCodeDataUri={exportAssets?.qrCodeDataUri ?? null}
              summary={summary}
            />
          ) : null}

          {validationError ? (
            <ThemedText lightColor={primaryColor} darkColor={primaryColor} style={styles.error}>
              {validationError}
            </ThemedText>
          ) : null}

          <Button title={t('reports.back')} variant="secondary" onPress={handleBack} />
        </ScreenContainer>

        <View style={[styles.shareFooter, { backgroundColor: surfaceColor, borderTopColor: borderColor }]}>
          <Button
            title={t('reports.shareReport')}
            disabled={isExporting || isLoadingReview || !previewContent || previewContent.isEmpty}
            trailingIcon={!canExportPdf ? <PlusLockButtonIcon /> : undefined}
            onPress={() => void handleShareReport()}
          />
        </View>
        {paywallVisible ? <LuluPlusPaywall visible onDismiss={dismissPaywall} /> : null}
      </View>
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

      {validationError ? (
        <ThemedText lightColor={primaryColor} darkColor={primaryColor} style={styles.error}>
          {validationError}
        </ThemedText>
      ) : null}

      <View style={styles.actions}>
        {step !== 'range' ? (
          <Button title={t('reports.back')} variant="secondary" onPress={handleBack} style={styles.actionButton} />
        ) : null}
        <Button title={t('reports.next')} onPress={handleNext} style={styles.actionButton} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  reviewRoot: {
    flex: 1,
  },
  reviewContent: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  reviewHint: {
    ...Typography.body,
    paddingHorizontal: Spacing.xs,
  },
  shareFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
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
