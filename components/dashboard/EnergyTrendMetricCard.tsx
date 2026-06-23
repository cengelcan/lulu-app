import { Palette } from '@/constants/theme';

import { ScoreTrendMetricCard } from '@/components/dashboard/ScoreTrendMetricCard';
import { TrendLineSparkline } from '@/components/dashboard/TrendLineSparkline';
import type { TrendMetric } from '@/utils/trends';

const ENERGY_ACCENT = Palette.badgeOrange;

type EnergyTrendMetricCardProps = {
  metric: TrendMetric;
};

export function EnergyTrendMetricCard({ metric }: EnergyTrendMetricCardProps) {
  return (
    <ScoreTrendMetricCard
      metric={metric}
      titleKey="dashboard.trendsEnergy"
      icon="bolt.fill"
      accentColor={ENERGY_ACCENT}
      chart={
        <TrendLineSparkline points={metric.sparklinePoints} color={ENERGY_ACCENT} />
      }
    />
  );
}
