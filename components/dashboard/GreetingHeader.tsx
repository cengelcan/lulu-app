import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { NotificationBellButton } from '@/components/dashboard/NotificationBellButton';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { CheckIn } from '@/types/check-in';
import { getAbnormalCheckInFields } from '@/utils/check-in';

type GreetingHeaderProps = {
  petName: string;
  ownerName: string | null;
  todayCheckIn: CheckIn | null;
};

export function GreetingHeader({ petName, ownerName, todayCheckIn }: GreetingHeaderProps) {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const greetingTitle = ownerName
    ? t('dashboard.greeting', { name: ownerName })
    : t('dashboard.greetingFallback');

  const subtitle = useMemo(() => {
    if (!todayCheckIn) {
      return t('dashboard.greetingSubtitlePending', { name: petName });
    }

    const abnormalFields = getAbnormalCheckInFields(todayCheckIn);

    if (abnormalFields.length === 0) {
      return t('dashboard.greetingSubtitleHealthy', { name: petName });
    }

    return t('dashboard.greetingSubtitleAttention', { name: petName });
  }, [petName, t, todayCheckIn]);

  return (
    <View style={styles.container}>
      <View style={styles.textColumn}>
        <ThemedText type="title" style={styles.title}>
          {greetingTitle}
        </ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      </View>
      <NotificationBellButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  textColumn: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    textAlign: 'left',
  },
  subtitle: {
    ...Typography.body,
  },
});
