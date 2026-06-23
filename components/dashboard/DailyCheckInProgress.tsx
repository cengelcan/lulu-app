import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { DashboardSectionHeader } from '@/components/dashboard/DashboardSectionHeader';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { useCheckInStore } from '@/stores/check-in.store';
import {
  formatLocalDate,
  formatWeekdayShort,
  getCurrentWeekDays,
  getTodayStart,
  isFutureLocalDate,
} from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';

const STATUS_CIRCLE_SIZE = 18;

const CHECK_IN_COLORS = {
  dark: {
    accent: Palette.badgeViolet,
    completedText: Palette.onDark,
    statusText: Palette.onDarkSoft,
    pendingText: '#71717A',
    pendingTextFuture: '#52525B',
    pendingBorder: '#27272A',
    pendingRing: '#3F3F46',
    pendingRingFuture: '#27272A',
  },
  light: {
    accent: Palette.badgeViolet,
    completedText: Palette.onDark,
    statusText: Palette.muted,
    pendingText: Palette.muted,
    pendingTextFuture: Palette.mutedSoft,
    pendingBorder: Palette.hairline,
    pendingRing: Palette.mutedSoft,
    pendingRingFuture: Palette.hairline,
  },
} as const;

type DayPillProps = {
  weekdayLabel: string;
  isCompleted: boolean;
  isFuture: boolean;
  colors: (typeof CHECK_IN_COLORS)['dark'];
  onPress: () => void;
};

function DayPill({ weekdayLabel, isCompleted, isFuture, colors, onPress }: DayPillProps) {
  const labelColor = isCompleted
    ? colors.completedText
    : isFuture
      ? colors.pendingTextFuture
      : colors.pendingText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isFuture }}
      accessibilityLabel={weekdayLabel}
      disabled={isFuture}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayPill,
        isCompleted
          ? { backgroundColor: colors.accent, borderColor: colors.accent }
          : { backgroundColor: 'transparent', borderColor: colors.pendingBorder },
        { opacity: pressed && !isFuture ? 0.85 : 1 },
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
      {isCompleted ? (
        <View style={[styles.statusCircle, { backgroundColor: colors.completedText }]}>
          <IconSymbol name="checkmark" size={10} color={colors.accent} />
        </View>
      ) : (
        <View
          style={[
            styles.statusCircle,
            styles.statusCirclePending,
            { borderColor: isFuture ? colors.pendingRingFuture : colors.pendingRing },
          ]}
        />
      )}
    </Pressable>
  );
}

export function DailyCheckInProgress() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const colorScheme = useColorScheme();
  const checkIns = useCheckInStore((state) => state.checkIns);
  const isLoading = useCheckInStore((state) => state.isLoading);

  const primaryColor = useThemeColor({}, 'primary');
  const colors = colorScheme === 'dark' ? CHECK_IN_COLORS.dark : CHECK_IN_COLORS.light;
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
      <DashboardSectionHeader
        title={t('dashboard.dailyCheckIn')}
        icon="calendar.badge.checkmark"
        iconColor={colors.accent}
      />
      <ThemedText
        lightColor={colors.statusText}
        darkColor={colors.statusText}
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
                colors={colors}
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
    minHeight: 58,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: 2,
    gap: Spacing.xs,
  },
  dayLabel: {
    ...Typography.caption,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 12,
  },
  statusCircle: {
    width: STATUS_CIRCLE_SIZE,
    height: STATUS_CIRCLE_SIZE,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCirclePending: {
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
  },
});
