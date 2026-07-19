import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { CheckIn } from '@/types/check-in';
import type { PetRecord } from '@/types/pet-record';
import { getAbnormalCheckInFields } from '@/utils/check-in';
import { formatCheckInTitleDate } from '@/utils/date';
import { getLatestCheckIn } from '@/utils/last-check-in';
import { getLocaleTag } from '@/utils/locale';
import { buildWeightChartData } from '@/utils/weight-chart';

type HealthOverviewCardProps = {
  checkIns: CheckIn[];
  petName: string;
  records: PetRecord[];
};

type HealthOverviewStatus = 'normal' | 'attention' | 'insufficient';

const STATUS_ICONS: Record<HealthOverviewStatus, IconSymbolName> = {
  normal: 'checkmark.circle.fill',
  attention: 'exclamationmark.triangle',
  insufficient: 'chart.bar.fill',
};

export function HealthOverviewCard({ checkIns, petName, records }: HealthOverviewCardProps) {
  const router = useRouter();
  const { fontScale, width } = useWindowDimensions();
  const { t, language } = useTranslation();
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const semanticAccentColor = useThemeColor({}, 'accent');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const locale = getLocaleTag(language);

  const latestCheckIn = useMemo(() => getLatestCheckIn(checkIns), [checkIns]);
  const abnormalFields = useMemo(
    () => (latestCheckIn ? getAbnormalCheckInFields(latestCheckIn) : []),
    [latestCheckIn]
  );
  const weightData = useMemo(() => buildWeightChartData(records), [records]);

  const status: HealthOverviewStatus = !latestCheckIn
    ? 'insufficient'
    : abnormalFields.length > 0
      ? 'attention'
      : 'normal';
  const statusAccentColor =
    status === 'normal'
      ? successColor
      : status === 'attention'
        ? warningColor
        : semanticAccentColor;

  const statusTitle =
    status === 'normal'
      ? t('dashboard.healthOverview.normalTitle')
      : status === 'attention'
        ? t('dashboard.healthOverview.attentionTitle')
        : t('dashboard.healthOverview.insufficientTitle');
  const statusMessage =
    status === 'normal'
      ? t('dashboard.healthOverview.normalMessage', { name: petName })
      : status === 'attention'
        ? t('dashboard.healthOverview.attentionMessage', { count: abnormalFields.length })
        : t('dashboard.healthOverview.insufficientMessage', { name: petName });

  const latestWeightLabel = weightData.latest
    ? t('records.summary.weightValue', {
        value: weightData.latest.value,
        unit: t(`records.units.${weightData.latest.unit}`),
      })
    : t('dashboard.healthOverview.noWeight');
  const stackMetrics = width < 350 || fontScale >= 1.4;

  return (
    <View style={styles.section}>
      <ThemedText accessibilityRole="header" type="subtitle" style={styles.sectionTitle}>
        {t('dashboard.healthOverview.title')}
      </ThemedText>
      <Card style={styles.card}>
        <View
          accessibilityLabel={`${statusTitle}. ${statusMessage}`}
          accessible
          style={styles.statusRow}>
          <View style={[styles.statusIcon, { backgroundColor: `${statusAccentColor}1F` }]}>
            <IconSymbol name={STATUS_ICONS[status]} size={22} color={statusAccentColor} />
          </View>
          <View style={styles.statusCopy}>
            <ThemedText type="defaultSemiBold">{statusTitle}</ThemedText>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.message}>
              {statusMessage}
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.metrics,
            stackMetrics ? styles.metricsStacked : null,
            { borderColor },
          ]}>
          <View style={styles.metric}>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.metricLabel}>
              {t('dashboard.healthOverview.lastCheckIn')}
            </ThemedText>
            <ThemedText selectable type="defaultSemiBold" style={styles.metricValue}>
              {latestCheckIn
                ? formatCheckInTitleDate(latestCheckIn.date, locale)
                : t('dashboard.healthOverview.noCheckIn')}
            </ThemedText>
          </View>
          <View
            style={[
              styles.metricDivider,
              stackMetrics ? styles.metricDividerStacked : null,
              { backgroundColor: borderColor },
            ]}
          />
          <View style={styles.metric}>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.metricLabel}>
              {t('dashboard.healthOverview.latestWeight')}
            </ThemedText>
            <ThemedText selectable type="defaultSemiBold" style={styles.metricValue}>
              {latestWeightLabel}
            </ThemedText>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.healthOverview.viewRecords')}
          onPress={() => router.push('/records' as Href)}
          style={({ pressed }) => [styles.link, { opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText type="link" style={styles.linkLabel}>
            {t('dashboard.healthOverview.viewRecords')}
          </ThemedText>
          <IconSymbol name="chevron.right" size={18} color={semanticAccentColor} />
        </Pressable>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleSmall,
  },
  card: {
    gap: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCopy: {
    flex: 1,
    gap: Spacing.xxs,
  },
  message: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  metrics: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
  },
  metricsStacked: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  metric: {
    flex: 1,
    gap: Spacing.xxs,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.sm,
  },
  metricDividerStacked: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 0,
  },
  metricLabel: {
    ...Typography.caption,
  },
  metricValue: {
    ...Typography.caption,
    fontSize: 14,
  },
  link: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkLabel: {
    ...Typography.bodySemiBold,
    fontSize: 14,
  },
});
