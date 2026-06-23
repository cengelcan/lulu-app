import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

export function RemindersFooter() {
  const router = useRouter();
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  return (
    <View style={styles.footer}>
      <IconSymbol name="bell.fill" size={16} color={textSecondaryColor} />
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.message}>
        {t('reminders.notificationHint')}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/settings' as Href)}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
        <ThemedText lightColor={brandAccentColor} darkColor={brandAccentColor} style={styles.link}>
          {t('reminders.manageNotificationSettings')}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  message: {
    ...Typography.caption,
    textAlign: 'center',
  },
  link: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
