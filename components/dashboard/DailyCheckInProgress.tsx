import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCheckInStore } from '@/stores/check-in.store';
import {
  formatLocalDate,
  formatWeekdayShort,
  getCurrentWeekDays,
  getTodayStart,
  isFutureLocalDate,
  isSameLocalDate,
} from '@/utils/date';

type DayPillProps = {
  date: Date;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  onPress: () => void;
};

function DayPill({ date, isCompleted, isToday, isFuture, onPress }: DayPillProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryTextColor = useThemeColor({}, 'primaryText');

  const backgroundColor = isCompleted ? successColor : surfaceColor;
  const labelColor = isCompleted ? primaryTextColor : isFuture ? textSecondaryColor : textColor;
  const pillBorderColor = isToday ? primaryColor : borderColor;
  const pillBorderWidth = isToday ? 2 : StyleSheet.hairlineWidth;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isFuture }}
      accessibilityLabel={`${formatWeekdayShort(date)}${isCompleted ? ', checked in' : ''}${
        isToday ? ', today' : ''
      }${isFuture ? ', unavailable' : ''}`}
      disabled={isFuture}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayPill,
        {
          backgroundColor,
          borderColor: pillBorderColor,
          borderWidth: pillBorderWidth,
          opacity: isFuture ? 0.45 : pressed ? 0.85 : 1,
        },
      ]}>
      <ThemedText
        lightColor={labelColor}
        darkColor={labelColor}
        style={styles.dayLabel}>
        {formatWeekdayShort(date)}
      </ThemedText>
      {isCompleted ? (
        <IconSymbol name="checkmark" size={14} color={primaryTextColor} />
      ) : (
        <View style={styles.checkPlaceholder} />
      )}
    </Pressable>
  );
}

export function DailyCheckInProgress() {
  const router = useRouter();
  const checkIns = useCheckInStore((state) => state.checkIns);
  const isLoading = useCheckInStore((state) => state.isLoading);

  const primaryColor = useThemeColor({}, 'primary');

  const weekDays = useMemo(() => getCurrentWeekDays(), []);
  const today = useMemo(() => getTodayStart(), []);

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

  const handleDayPress = (day: Date) => {
    const dayKey = formatLocalDate(day);
    router.push(`/check-in?date=${dayKey}`);
  };

  return (
    <Card>
      <ThemedText type="subtitle">Daily Check-In Progress</ThemedText>
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
                date={day}
                isCompleted={completedDayKeys.has(dayKey)}
                isToday={isSameLocalDate(day, today)}
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
  loading: {
    alignSelf: 'flex-start',
  },
  weekRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dayPill: {
    flex: 1,
    minHeight: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  dayLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
  checkPlaceholder: {
    height: 14,
  },
});
