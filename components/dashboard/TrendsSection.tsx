import { StyleSheet, View } from 'react-native';

import { DashboardSectionHeader } from '@/components/dashboard/DashboardSectionHeader';
import { TrendMetricCard } from '@/components/dashboard/TrendMetricCard';
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
      <DashboardSectionHeader title={t('dashboard.trendsTitle')} icon="chart.line.uptrend.xyaxis" />
      <View style={styles.row}>
        <TrendMetricCard metric={trends.weight} />
        <TrendMetricCard metric={trends.appetite} />
        <TrendMetricCard metric={trends.energy} />
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
