import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { useCheckInStore } from '@/stores/check-in.store';
import {
  formatLocalDate,
  formatWeekdayShort,
  getCurrentWeekDays,
  getTodayStart,
  isFutureLocalDate,
  isSameLocalDate,
} from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';

type DayPillProps = {
  weekdayLabel: string;
  isCompleted: boolean;
  isFuture: boolean;
  onPress: () => void;
};

function DayPill({ weekdayLabel, isCompleted, isFuture, onPress }: DayPillProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const successColor = useThemeColor({}, 'success');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryTextColor = useThemeColor({}, 'primaryText');

  const backgroundColor = isCompleted ? successColor : surfaceColor;
  const labelColor = isCompleted ? primaryTextColor : isFuture ? textSecondaryColor : textColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isFuture }}
      accessibilityLabel={weekdayLabel}
      disabled={isFuture}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayPill,
        {
          backgroundColor,
          borderColor: isCompleted ? successColor : borderColor,
          borderWidth: isCompleted ? 0 : StyleSheet.hairlineWidth,
          opacity: isFuture ? 0.45 : pressed ? 0.85 : 1,
        },
      ]}>
      <ThemedText
        lightColor={labelColor}
        darkColor={labelColor}
        style={styles.dayLabel}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}>
        {weekdayLabel}
      </ThemedText>
    </Pressable>
  );
}

export function DailyCheckInProgress() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const checkIns = useCheckInStore((state) => state.checkIns);
  const isLoading = useCheckInStore((state) => state.isLoading);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const locale = getLocaleTag(language);

  const weekDays = useMemo(() => getCurrentWeekDays(), []);
  const today = useMemo(() => getTodayStart(), []);
  const todayKey = useMemo(() => formatLocalDate(today), [today]);

  const completedDayKeys = useMemo(() => {
    const weekDayKeys = new Set(weekDays.map(formatLocalDate));
    const completed = new Set<string>();

    for (const checkIn of checkIns) {
      if (weekDayKeys.has(checkIn.date)) {
        completed.add(checkIn.date);
      }
    }

    return completed;
  }, [checkIns, weekDays]);

  const isTodayCompleted = completedDayKeys.has(todayKey);

  const statusMessage = isTodayCompleted
    ? t('dashboard.checkInCompletedToday')
    : t('dashboard.checkInPendingToday');

  const handleDayPress = (day: Date) => {
    const dayKey = formatLocalDate(day);
    router.push(`/check-in?date=${dayKey}`);
  };

  return (
    <Card>
      <ThemedText type="subtitle">{t('dashboard.dailyCheckIn')}</ThemedText>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.statusMessage}>
        {statusMessage}
      </ThemedText>

      {isLoading && checkIns.length === 0 ? (
        <ActivityIndicator color={primaryColor} style={styles.loading} />
      ) : (
        <View style={styles.weekRow}>
          {weekDays.map((day) => {
            const dayKey = formatLocalDate(day);
            const isFuture = isFutureLocalDate(day);

            return (
              <DayPill
                key={dayKey}
                weekdayLabel={formatWeekdayShort(day, locale)}
                isCompleted={completedDayKeys.has(dayKey)}
                isFuture={isFuture}
                onPress={() => handleDayPress(day)}
              />
            );
          })}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  statusMessage: {
    ...Typography.body,
  },
  loading: {
    alignSelf: 'flex-start',
  },
  weekRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dayPill: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 2,
  },
  dayLabel: {
    ...Typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
});
