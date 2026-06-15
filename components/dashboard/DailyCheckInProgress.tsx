import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
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

type MissedCheckInCta = {
  message: string;
  date: string;
};

type DayPillProps = {
  weekdayLabel: string;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  onPress: () => void;
};

function DayPill({ weekdayLabel, isCompleted, isToday, isFuture, onPress }: DayPillProps) {
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
      accessibilityLabel={weekdayLabel}
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
        style={styles.dayLabel}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}>
        {weekdayLabel}
      </ThemedText>
      {isCompleted ? (
        <IconSymbol name="checkmark" size={14} color={primaryTextColor} />
      ) : (
        <View style={styles.checkPlaceholder} />
      )}
    </Pressable>
  );
}

function getMissedCheckInCta(
  completedDayKeys: Set<string>,
  today: Date,
  t: (key: string) => string
): MissedCheckInCta | null {
  const todayKey = formatLocalDate(today);

  if (!completedDayKeys.has(todayKey)) {
    return {
      message: t('dashboard.missedCheckInToday'),
      date: todayKey,
    };
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatLocalDate(yesterday);

  if (!completedDayKeys.has(yesterdayKey)) {
    return {
      message: t('dashboard.missedCheckInYesterday'),
      date: yesterdayKey,
    };
  }

  return null;
}

export function DailyCheckInProgress() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const checkIns = useCheckInStore((state) => state.checkIns);
  const isLoading = useCheckInStore((state) => state.isLoading);

  const primaryColor = useThemeColor({}, 'primary');
  const warningSurfaceColor = useThemeColor({}, 'surface');
  const locale = getLocaleTag(language);

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

  const missedCta = useMemo(
    () => getMissedCheckInCta(completedDayKeys, today, t),
    [completedDayKeys, today, t]
  );

  const handleDayPress = (day: Date) => {
    const dayKey = formatLocalDate(day);
    router.push(`/check-in?date=${dayKey}`);
  };

  const handleMissedCtaPress = () => {
    if (!missedCta) {
      return;
    }

    router.push(`/check-in?date=${missedCta.date}`);
  };

  return (
    <Card>
      <ThemedText type="subtitle">{t('dashboard.dailyCheckInProgress')}</ThemedText>

      {missedCta ? (
        <Pressable
          accessibilityRole="button"
          onPress={handleMissedCtaPress}
          style={({ pressed }) => [
            styles.missedBanner,
            {
              backgroundColor: warningSurfaceColor,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <ThemedText type="defaultSemiBold" style={styles.missedMessage} numberOfLines={2}>
            {missedCta.message}
          </ThemedText>
          <View style={styles.missedCtaRow}>
            <ThemedText lightColor={primaryColor} darkColor={primaryColor} type="defaultSemiBold">
              {t('dashboard.missedCheckInCta')}
            </ThemedText>
            <IconSymbol name="chevron.right" size={14} color={primaryColor} />
          </View>
        </Pressable>
      ) : null}

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
  missedBanner: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  missedMessage: {
    ...Typography.body,
  },
  missedCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  weekRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dayPill: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 2,
  },
  dayLabel: {
    ...Typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkPlaceholder: {
    height: 14,
  },
});
