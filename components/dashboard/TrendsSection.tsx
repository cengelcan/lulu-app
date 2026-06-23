import { StyleSheet, View } from 'react-native';

import { DashboardSectionHeader } from '@/components/dashboard/DashboardSectionHeader';
import { AppetiteTrendMetricCard } from '@/components/dashboard/AppetiteTrendMetricCard';
import { EnergyTrendMetricCard } from '@/components/dashboard/EnergyTrendMetricCard';
import { WeightTrendMetricCard } from '@/components/dashboard/WeightTrendMetricCard';
import { Spacing } from '@/constants/theme';
import type { DashboardTrends } from '@/utils/trends';
import { useTranslation } from '@/hooks/use-translation';

type TrendsSectionProps = {
  trends: DashboardTrends;
};

export function TrendsSection({ trends }: TrendsSectionProps) {
  const { t } = useTranslation();

  if (!trends.hasAnyData) {
    return null;
  }

  return (
    <View style={styles.section}>
      <DashboardSectionHeader
        title={t('dashboard.trendsTitle')}
        icon="chart.line.uptrend.xyaxis"
        detailLabel={t('dashboard.trendsComparedToLast30Days')}
      />
      <View style={styles.row}>
        <WeightTrendMetricCard metric={trends.weight} />
        <AppetiteTrendMetricCard metric={trends.appetite} />
        <EnergyTrendMetricCard metric={trends.energy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
