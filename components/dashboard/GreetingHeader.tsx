import { StyleSheet, View } from 'react-native';

import { NotificationBellButton } from '@/components/dashboard/NotificationBellButton';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { getLocaleTag } from '@/utils/locale';

type GreetingHeaderProps = {
  ownerName: string | null;
};

export function GreetingHeader({ ownerName }: GreetingHeaderProps) {
  const { t, language } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const greetingTitle = ownerName
    ? t('dashboard.greeting', { name: ownerName })
    : t('dashboard.greetingFallback');

  const dateLabel = new Date().toLocaleDateString(getLocaleTag(language), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

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
          {dateLabel}
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
