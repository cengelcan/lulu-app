import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { TrendMetricCard } from '@/components/dashboard/TrendMetricCard';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { DashboardTrends, TrendMetric } from '@/utils/trends';

type TrendsSectionProps = {
  trends: DashboardTrends;
};

export function TrendsSection({ trends }: TrendsSectionProps) {
  const { t } = useTranslation();
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const [slideWidth, setSlideWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleCarouselLayout = useCallback((event: LayoutChangeEvent) => {
    setSlideWidth(event.nativeEvent.layout.width);
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (slideWidth <= 0) {
        return;
      }

      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
      setActiveIndex(nextIndex);
    },
    [slideWidth]
  );

  const renderItem = useCallback(
    ({ item }: { item: TrendMetric }) => (
      <View style={[styles.slide, slideWidth > 0 ? { width: slideWidth } : null]}>
        <TrendMetricCard metric={item} />
      </View>
    ),
    [slideWidth]
  );

  const keyExtractor = useCallback((item: TrendMetric) => item.kind, []);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          {t('dashboard.trendsTitle')}
        </ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.period}>
          {t('dashboard.trendsPeriod')}
        </ThemedText>
      </View>

      <View style={styles.carousel} onLayout={handleCarouselLayout}>
        {slideWidth > 0 ? (
          <FlatList
            data={trends.metrics}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            getItemLayout={(_, index) => ({
              length: slideWidth,
              offset: slideWidth * index,
              index,
            })}
          />
        ) : null}
      </View>

      <View style={styles.dots}>
        {trends.metrics.map((metric, index) => (
          <View
            key={metric.kind}
            style={[
              styles.dot,
              { backgroundColor: borderColor },
              index === activeIndex ? [styles.dotActive, { backgroundColor: primaryColor }] : null,
            ]}
          />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  title: {
    ...Typography.bodySemiBold,
    fontSize: 16,
  },
  period: {
    ...Typography.caption,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  carousel: {
    width: '100%',
  },
  slide: {
    width: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.xxs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    opacity: 0.45,
  },
  dotActive: {
    width: 18,
    opacity: 1,
  },
});
