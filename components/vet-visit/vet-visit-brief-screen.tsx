import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { ReportDocumentPreview } from '@/components/reports/ReportDocumentPreview';
import { ReportCheckboxRow } from '@/components/reports/ReportCheckboxRow';
import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ContentState } from '@/components/ui/content-state';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PlusLockButtonIcon } from '@/components/ui/PlusLockIcon';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { REPORT_BRAND_COLOR } from '@/constants/branding';
import { LayoutTokens } from '@/constants/layout';
import {
  createDefaultReportDataSelection,
  REPORT_CHECK_IN_DATA_KEYS,
  REPORT_RANGE_PRESETS,
  REPORT_RECORD_DATA_KEYS,
} from '@/constants/reports';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { usePlusFeature } from '@/hooks/use-plus-feature';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { buildReportPreviewContent } from '@/services/reports/build-report-preview';
import { buildReportSummary } from '@/services/reports/build-report-summary';
import { exportReportPdf } from '@/services/reports/export-report-pdf';
import { generateReportHtml } from '@/services/reports/generate-report-html';
import { buildVisitBrief } from '@/services/vet-visits/build-visit-brief';
import * as checkInStorage from '@/storage/check-in.storage';
import * as medicationStorage from '@/storage/medication.storage';
import * as petRecordStorage from '@/storage/pet-record.storage';
import { usePetStore } from '@/stores/pet.store';
import type {
  ReportDataSelection,
  ReportDateRange,
  ReportDocumentLabels,
  ReportPetSummary,
  ReportPreviewContent,
  ReportRangePreset,
  ReportShellLabels,
  ReportSummary,
} from '@/types/report';
import {
  DEFAULT_VISIT_BRIEF_SELECTION,
  type VisitBrief,
  type VisitBriefDocumentLabels,
  type VisitBriefSection,
  type VisitBriefSelection,
} from '@/types/vet-visit';
import { formatCheckInTitleDate } from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';
import { canViewReports } from '@/utils/pet-access';
import { buildReportPetSummary } from '@/utils/report-pet-summary';
import {
  type ReportExportAssets,
  resolveReportExportAssets,
} from '@/utils/report-export-assets';
import {
  getPresetDateRange,
  isReportDateRangeValid,
  resolveReportDateRange,
} from '@/utils/report-range';
import { translateError } from '@/utils/translate-error';

const REASON_LIMIT = 300;
const QUESTION_LIMIT = 1000;

function buildReportSelection(selection: VisitBriefSelection): ReportDataSelection {
  const reportSelection = createDefaultReportDataSelection();
  for (const key of REPORT_CHECK_IN_DATA_KEYS) {
    reportSelection.checkIn[key] = selection.checkIns;
  }
  for (const key of REPORT_RECORD_DATA_KEYS) {
    reportSelection.records[key] = selection.records;
  }
  reportSelection.medications = selection.medications;
  return reportSelection;
}

export function VetVisitBriefScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);
  const petDisplay = usePetDisplay();
  const pet = usePetStore((state) => state.pet);
  const isPetLoading = usePetStore((state) => state.isLoading);
  const loadPet = usePetStore((state) => state.loadPet);
  const { allowed: canExportPdf, requestAccess } = usePlusFeature('pdfExport');

  const [range, setRange] = useState<ReportDateRange>(() => ({
    preset: '30d',
    ...getPresetDateRange('30d'),
  }));
  const [selection, setSelection] = useState(DEFAULT_VISIT_BRIEF_SELECTION);
  const [reasonText, setReasonText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [brief, setBrief] = useState<VisitBrief | null>(null);
  const [previewContent, setPreviewContent] = useState<ReportPreviewContent | null>(null);
  const [petSummary, setPetSummary] = useState<ReportPetSummary | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [exportAssets, setExportAssets] = useState<ReportExportAssets | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const alertColor = useThemeColor({}, 'alert');

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  useEffect(() => {
    if (pet && !canViewReports(pet)) {
      router.replace('/(tabs)/care');
    }
  }, [pet, router]);

  const formatDate = useCallback(
    (date: string) => formatCheckInTitleDate(date, locale),
    [locale]
  );

  const resolvedRangeLabel = useMemo(() => {
    const resolved = resolveReportDateRange(range);
    return `${formatDate(resolved.startDate)} – ${formatDate(resolved.endDate)}`;
  }, [formatDate, range]);

  const generatedAtLabel = useMemo(
    () =>
      new Date().toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
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
      pdfTitleSuffix: t('vetVisit.exportFileName'),
      qrCodeAlt: t('reports.qrCodeAlt'),
      appStoreBadgeAriaLabel: t('reports.review.appStoreBadge'),
      appStoreBadgeLine1: t('reports.appStoreBadgeLine1'),
      appStoreBadgeLine2: t('reports.appStoreBadgeLine2'),
    }),
    [t]
  );

  const visitLabels = useMemo<VisitBriefDocumentLabels>(
    () => ({
      sectionTitle: t('vetVisit.pdf.title'),
      reason: t('vetVisit.pdf.reason'),
      highlights: t('vetVisit.highlightsTitle'),
      questions: t('vetVisit.questionsTitle'),
      disclaimer: t('vetVisit.disclaimer'),
      sourceReferences: t('vetVisit.pdf.sourceReferences'),
    }),
    [t]
  );

  const formatPageLabel = useCallback(
    (current: number, total: number) => t('reports.review.pageOf', { current, total }),
    [t]
  );

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
    if (
      !Object.values(selection).some(Boolean) &&
      !reasonText.trim() &&
      !questionText.trim()
    ) {
      setError(t('reports.validation.noDataSelected'));
      return;
    }

    setIsBuilding(true);
    setError(null);
    try {
      const resolvedRange = resolveReportDateRange(range);
      const [checkIns, records, medicationPlans, medicationDoses] = await Promise.all([
        checkInStorage.getCheckInsByPetId(pet.id),
        petRecordStorage.getPetRecordsByPetId(pet.id),
        medicationStorage.getMedicationPlansByPetId(pet.id),
        medicationStorage.getMedicationDosesByPetId(
          pet.id,
          resolvedRange.startDate,
          resolvedRange.endDate
        ),
      ]);

      const nextBrief = buildVisitBrief({
        range,
        selection,
        checkIns,
        records,
        medicationPlans,
        reason: reasonText,
        questions: questionText.split('\n'),
        t,
      });
      const nextContent = buildReportPreviewContent({
        range,
        selection: buildReportSelection(selection),
        checkIns,
        records,
        medicationPlans,
        medicationDoses,
        t,
        locale,
      });
      const nextPetSummary = buildReportPetSummary(pet, records, {
        ...petDisplay,
        t,
        locale,
      });

      setBrief(nextBrief);
      setPreviewContent(nextContent);
      setPetSummary(nextPetSummary);
      setSummary(buildReportSummary({ content: nextContent, t }));
      setExportAssets(await resolveReportExportAssets(nextPetSummary.photoUri));
    } catch {
      setBrief(null);
      setPreviewContent(null);
      setPetSummary(null);
      setSummary(null);
      setExportAssets(null);
      setError(t('errors.unknown'));
    } finally {
      setIsBuilding(false);
    }
  };

  const sharePdf = async () => {
    if (!brief || !previewContent || !petSummary) return;
    if (!canExportPdf) {
      requestAccess();
      return;
    }

    setIsExporting(true);
    setError(null);
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
        primaryColor: REPORT_BRAND_COLOR,
        summary,
        visitBrief: brief,
        visitLabels,
      });

      await exportReportPdf(html, {
        fileName: `${petSummary.name} - ${t('vetVisit.exportFileName')} (${resolvedRangeLabel})`,
        shareDialogTitle: t('vetVisit.shareDialogTitle'),
        defaultFileName: t('reports.defaultFileName'),
      });
    } catch (exportError) {
      if (__DEV__) console.error('Visit report export failed:', exportError);
      const errorKey =
        exportError instanceof Error && exportError.message.startsWith('errors.')
          ? exportError.message
          : null;
      setError(translateError(t, errorKey) ?? t('vetVisit.exportFailed'));
    } finally {
      setIsExporting(false);
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

  if (brief && previewContent && petSummary) {
    const hasShareableContent = !brief.isEmpty || !previewContent.isEmpty;

    return (
      <ScreenContent
        footer={
          <Button
            title={t('vetVisit.sharePdf')}
            disabled={isExporting || !hasShareableContent}
            trailingIcon={!canExportPdf ? <PlusLockButtonIcon /> : undefined}
            onPress={() => void sharePdf()}
          />
        }>
        <View style={styles.intro}>
          <ThemedText type="subtitle">{t('reports.steps.reviewTitle')}</ThemedText>
          <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor}>
            {t('reports.review.hint')}
          </ThemedText>
        </View>

        {hasShareableContent ? (
          <ReportDocumentPreview
            content={previewContent}
            formatDate={formatDate}
            formatPageLabel={formatPageLabel}
            generatedAtLabel={generatedAtLabel}
            labels={documentLabels}
            shellLabels={shellLabels}
            language={language}
            pet={petSummary}
            primaryColor={REPORT_BRAND_COLOR}
            photoDataUri={exportAssets?.photoDataUri ?? null}
            qrCodeDataUri={exportAssets?.qrCodeDataUri ?? null}
            summary={summary}
            visitBrief={brief}
            visitLabels={visitLabels}
          />
        ) : (
          <ContentState
            kind="empty"
            presentation="card"
            title={t('vetVisit.noDataTitle')}
            message={t('vetVisit.noDataDescription')}
          />
        )}

        {brief.sources.length > 0 ? (
          <View style={styles.section}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isSourcesExpanded }}
              onPress={() => setIsSourcesExpanded((current) => !current)}
              style={({ pressed }) => [styles.sourceDisclosure, { opacity: pressed ? 0.7 : 1 }]}>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.sourceDisclosureLabel}>
                {t('vetVisit.sourcesTitle')} ({brief.sources.length})
              </ThemedText>
              <IconSymbol
                name={isSourcesExpanded ? 'chevron.up' : 'chevron.down'}
                size={16}
                color={textSecondaryColor}
              />
            </Pressable>
            {isSourcesExpanded ? (
              <Card style={styles.sourcesCard}>
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
                        {formatDate(source.date)}
                      </ThemedText>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
                  </Pressable>
                ))}
              </Card>
            ) : null}
          </View>
        ) : null}

        {error ? (
          <ThemedText
            accessibilityLiveRegion="assertive"
            lightColor={alertColor}
            darkColor={alertColor}
            selectable
            style={styles.error}>
            {error}
          </ThemedText>
        ) : null}
        <Button
          title={t('vetVisit.editBrief')}
          variant="secondary"
          onPress={() => {
            setIsSourcesExpanded(false);
            setBrief(null);
          }}
        />
      </ScreenContent>
    );
  }

  return (
    <ScreenContent
      footer={
        <Button
          title={t('vetVisit.buildBrief')}
          disabled={isBuilding}
          onPress={() => void buildBrief()}
        />
      }>
      <View style={styles.intro}>
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
        <ThemedText type="defaultSemiBold">{t('vetVisit.reasonTitle')}</ThemedText>
        <TextInput
          accessibilityLabel={t('vetVisit.reasonTitle')}
          maxLength={REASON_LIMIT}
          multiline
          onChangeText={setReasonText}
          placeholder={t('vetVisit.reasonPlaceholder')}
          placeholderTextColor={textSecondaryColor}
          style={[
            styles.input,
            styles.reasonInput,
            { backgroundColor: surfaceColor, borderColor, color: textColor },
          ]}
          textAlignVertical="top"
          value={reasonText}
        />
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.hint}>
          {t('vetVisit.reasonHint')}
        </ThemedText>
      </View>

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
          selectable
          style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
    </ScreenContent>
  );
}

function ScreenContent({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <ScreenContainer
      scrollable
      footer={footer}
      edges={['bottom']}
      maxContentWidth={LayoutTokens.readingContentMaxWidth}
      contentStyle={styles.content}>
      {children}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  intro: { gap: Spacing.xs },
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
  reasonInput: { minHeight: 96 },
  hint: { ...Typography.caption },
  error: { ...Typography.caption },
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
  sourceDisclosure: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  sourceDisclosureLabel: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sourcesCard: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
});
