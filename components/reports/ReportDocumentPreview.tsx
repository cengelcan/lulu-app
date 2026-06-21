import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ReportCheckInMetricPill } from '@/components/reports/ReportCheckInMetricPill';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getReportQrCodeUrl, REPORT_APP_NAME, REPORT_APP_URL } from '@/constants/branding';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ReportDocumentLabels, ReportPetSummary, ReportPreviewContent } from '@/types/report';

type ReportDocumentPreviewProps = {
  pet: ReportPetSummary;
  content: ReportPreviewContent;
  labels: ReportDocumentLabels;
  formatDate: (date: string) => string;
  generatedAtLabel: string;
  footerPageLabel: string;
};

type DetailCellProps = {
  label: string;
  value: string;
};

function DetailCell({ label, value }: DetailCellProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.detailCell}>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.detailLabel}>
        {label}
      </ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.detailValue} numberOfLines={2}>
        {value}
      </ThemedText>
    </View>
  );
}

export function ReportDocumentPreview({
  pet,
  content,
  labels,
  formatDate,
  generatedAtLabel,
  footerPageLabel,
}: ReportDocumentPreviewProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const primaryTextColor = useThemeColor({}, 'primaryText');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const backgroundColor = useThemeColor({}, 'background');

  const qrCodeUrl = getReportQrCodeUrl();

  return (
    <View style={[styles.document, { backgroundColor: surfaceColor, borderColor }]}>
      <View style={[styles.brandHeader, { backgroundColor: primaryColor }]}>
        <View style={styles.brandLeft}>
          <ThemedText lightColor={primaryTextColor} darkColor={primaryTextColor} style={styles.brandName}>
            {REPORT_APP_NAME}
          </ThemedText>
          <ThemedText lightColor={primaryTextColor} darkColor={primaryTextColor} style={styles.brandBadge}>
            {labels.appStoreBadge}
          </ThemedText>
        </View>
        <Image accessibilityLabel="App download QR code" source={{ uri: qrCodeUrl }} style={styles.qrCode} />
      </View>

      <View style={[styles.petCard, { backgroundColor, borderColor }]}>
        <View style={styles.petHeader}>
          <PetAvatar photoUri={pet.photoUri} size={80} />
          <View style={styles.petHeaderText}>
            <ThemedText type="title" style={styles.petName}>
              {pet.name}
            </ThemedText>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.petSubtitle}>
              {pet.speciesLabel} · {pet.breedLabel}
            </ThemedText>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <DetailCell label={labels.species} value={pet.speciesLabel} />
          <DetailCell label={labels.sex} value={pet.sexLabel} />
          <DetailCell label={labels.birthDate} value={pet.birthDateLabel} />
          <DetailCell label={labels.sterilization} value={pet.spayNeuterLabel} />
          <DetailCell label={labels.weight} value={pet.weightLabel} />
        </View>

        <View style={styles.petFooter}>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.petFooterLine}>
            {labels.owner}: {pet.ownerName}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.petFooterLine}>
            {labels.microchip}: {pet.microchipId}
          </ThemedText>
        </View>
      </View>

      {content.isEmpty ? (
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.empty}>
          {labels.empty}
        </ThemedText>
      ) : (
        <>
          {content.checkIns.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {labels.dailyObservations}
              </ThemedText>
              {content.checkIns.map((day) => (
                <View key={day.date} style={styles.dayBlock}>
                  <ThemedText type="defaultSemiBold" style={styles.dayTitle}>
                    {formatDate(day.date)}
                  </ThemedText>
                  <View style={styles.metricsRow}>
                    {day.fields.map((field) => (
                      <ReportCheckInMetricPill key={`${day.date}-${field.key}`} field={field} />
                    ))}
                  </View>
                  {day.notes ? (
                    <ThemedText
                      lightColor={textSecondaryColor}
                      darkColor={textSecondaryColor}
                      style={styles.dayNotes}>
                      {labels.notes}: {day.notes}
                    </ThemedText>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {content.recordGroups.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {labels.recordsSection}
              </ThemedText>
              {content.recordGroups.map((group) => (
                <View key={group.date} style={styles.recordDayBlock}>
                  <ThemedText type="defaultSemiBold" style={styles.recordDayTitle}>
                    {formatDate(group.date)}
                  </ThemedText>
                  {group.entries.map((entry, index) => (
                    <View key={`${group.date}-${entry.time}-${index}`} style={styles.recordRow}>
                      <ThemedText
                        lightColor={textSecondaryColor}
                        darkColor={textSecondaryColor}
                        style={styles.recordTime}>
                        {entry.time}
                      </ThemedText>
                      <View style={styles.recordBody}>
                        <View style={styles.recordTitleRow}>
                          <IconSymbol name={entry.icon} size={18} color={primaryColor} />
                          <ThemedText type="defaultSemiBold" style={styles.recordTypeLabel}>
                            {entry.typeLabel}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.recordDetail}>{entry.detail}</ThemedText>
                        {entry.notes ? (
                          <ThemedText
                            lightColor={textSecondaryColor}
                            darkColor={textSecondaryColor}
                            style={styles.recordNotes}>
                            {labels.notes}: {entry.notes}
                          </ThemedText>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}

      <View style={[styles.reportFooter, { backgroundColor: primaryColor }]}>
        <ThemedText lightColor={primaryTextColor} darkColor={primaryTextColor} style={styles.footerBrand}>
          {REPORT_APP_NAME}
        </ThemedText>
        <ThemedText lightColor={primaryTextColor} darkColor={primaryTextColor} style={styles.footerMeta}>
          {generatedAtLabel}
        </ThemedText>
        <ThemedText lightColor={primaryTextColor} darkColor={primaryTextColor} style={styles.footerMeta}>
          {footerPageLabel}
        </ThemedText>
        <ThemedText lightColor={primaryTextColor} darkColor={primaryTextColor} style={styles.footerMeta}>
          {REPORT_APP_URL.replace('https://', '')}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  document: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  brandLeft: {
    flex: 1,
    gap: Spacing.xs,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  brandBadge: {
    ...Typography.caption,
    opacity: 0.92,
  },
  qrCode: {
    width: 72,
    height: 72,
    borderRadius: Radius.sm,
    backgroundColor: '#FFFFFF',
  },
  petCard: {
    margin: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  petHeaderText: {
    flex: 1,
    gap: Spacing.xs,
  },
  petName: {
    fontSize: 24,
    lineHeight: 28,
  },
  petSubtitle: {
    ...Typography.body,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  detailCell: {
    width: '31%',
    minWidth: 96,
    gap: 2,
  },
  detailLabel: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    ...Typography.caption,
  },
  petFooter: {
    gap: 2,
  },
  petFooterLine: {
    ...Typography.caption,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    textAlign: 'center',
  },
  dayBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dayTitle: {
    ...Typography.body,
    textAlign: 'center',
    width: '100%',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    width: '100%',
    paddingVertical: Spacing.xs,
  },
  dayNotes: {
    ...Typography.caption,
    textAlign: 'center',
    width: '100%',
  },
  recordDayBlock: {
    gap: Spacing.sm,
  },
  recordDayTitle: {
    ...Typography.body,
  },
  recordRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  recordTime: {
    ...Typography.caption,
    width: 52,
    paddingTop: 2,
  },
  recordBody: {
    flex: 1,
    gap: 2,
  },
  recordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  recordTypeLabel: {
    flexShrink: 1,
  },
  recordDetail: {
    ...Typography.body,
  },
  recordNotes: {
    ...Typography.caption,
  },
  empty: {
    ...Typography.body,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  reportFooter: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  footerBrand: {
    ...Typography.caption,
    fontWeight: '700',
  },
  footerMeta: {
    ...Typography.caption,
    opacity: 0.92,
  },
});
