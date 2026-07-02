import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { WeightChart } from '@/components/dashboard/WeightChart';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { PetRecord } from '@/types/pet-record';
import { buildWeightChartData } from '@/utils/weight-chart';

const WEIGHT_ACCENT = Palette.badgeViolet;

type WeightSectionProps = {
  records: PetRecord[];
};

export function WeightSection({ records }: WeightSectionProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const titleColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const chartData = useMemo(() => buildWeightChartData(records), [records]);

  const latestLabel = useMemo(() => {
    if (!chartData.latest) {
      return null;
    }

    return t('records.summary.weightValue', {
      value: chartData.latest.value,
      unit: t(`records.units.${chartData.latest.unit}`),
    });
  }, [chartData.latest, t]);

  const handleAddWeight = () => {
    router.push('/records/weight' as Href);
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol name="scalemass.fill" size={18} color={WEIGHT_ACCENT} />
          <View style={styles.headerTitles}>
            <ThemedText
              lightColor={titleColor}
              darkColor={titleColor}
              style={styles.title}
              numberOfLines={1}>
              {t('dashboard.trendsWeight')}
            </ThemedText>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.subtitle}
              numberOfLines={1}>
              {t('dashboard.weightSubtitle')}
            </ThemedText>
          </View>
        </View>

        {latestLabel ? (
          <ThemedText
            lightColor={titleColor}
            darkColor={titleColor}
            style={styles.latestValue}
            numberOfLines={1}>
            {latestLabel}
          </ThemedText>
        ) : null}
      </View>

      <WeightChart data={chartData} onAddPress={handleAddWeight} />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    flex: 1,
  },
  headerTitles: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    ...Typography.caption,
    fontSize: 12,
    lineHeight: 16,
  },
  latestValue: {
    ...Typography.bodySemiBold,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    flexShrink: 0,
  },
});
