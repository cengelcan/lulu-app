import { Palette } from '@/constants/theme';

import { AppetiteTrendBarSparkline } from '@/components/dashboard/AppetiteTrendBarSparkline';
import { ScoreTrendMetricCard } from '@/components/dashboard/ScoreTrendMetricCard';
import type { TrendMetric } from '@/utils/trends';

const APPETITE_ACCENT = Palette.badgeEmerald;

type AppetiteTrendMetricCardProps = {
  metric: TrendMetric;
};

export function AppetiteTrendMetricCard({ metric }: AppetiteTrendMetricCardProps) {
  return (
    <ScoreTrendMetricCard
      metric={metric}
      titleKey="dashboard.trendsAppetite"
      icon="fork.knife.circle"
      accentColor={APPETITE_ACCENT}
      chart={
        <AppetiteTrendBarSparkline
          points={metric.sparklinePoints}
          color={APPETITE_ACCENT}
        />
      }
    />
  );
}
