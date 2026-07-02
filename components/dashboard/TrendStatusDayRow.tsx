import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { formatWeekdayShort, parseLocalDate } from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';
import type { TrendChartDay, TrendDailyStatus } from '@/utils/trends';

const STATUS_CONFIG: Record<
  Exclude<TrendDailyStatus, 'no_data'>,
  { icon: 'face.smiling' | 'exclamationmark.circle' | 'eye.slash'; color: string }
> = {
  normal: { icon: 'face.smiling', color: Palette.success },
  attention: { icon: 'exclamationmark.circle', color: Palette.error },
  not_observed: { icon: 'eye.slash', color: Palette.muted },
};

type TrendStatusDayRowProps = {
  chartDays: TrendChartDay[];
};

function formatWeekdayLetter(dateKey: string, locale: string): string {
  const date = parseLocalDate(dateKey);
  if (!date) {
    return '';
  }

  return formatWeekdayShort(date, locale).charAt(0).toUpperCase();
}

export function TrendStatusDayRow({ chartDays }: TrendStatusDayRowProps) {
  const { language } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const locale = getLocaleTag(language);

  return (
    <View style={styles.wrapper}>
      <View style={styles.icons}>
        {chartDays.map((day) => {
          if (day.status === 'no_data') {
            return (
              <View key={day.date} style={[styles.emptySlot, { borderColor }]} />
            );
          }

          const config = STATUS_CONFIG[day.status];

          return (
            <IconSymbol
              key={day.date}
              name={config.icon}
              size={14}
              color={config.color}
            />
          );
        })}
      </View>
      <View style={styles.labels}>
        {chartDays.map((day) => (
          <ThemedText
            key={day.date}
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.label}
            numberOfLines={1}>
            {formatWeekdayLetter(day.date, locale)}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  icons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 2,
  },
  emptySlot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: StyleSheet.hairlineWidth,
    opacity: 0.35,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    ...Typography.caption,
    flex: 1,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
});
