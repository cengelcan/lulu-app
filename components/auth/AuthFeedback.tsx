import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type AuthFeedbackVariant = 'success' | 'info';

type AuthFeedbackProps = {
  variant: AuthFeedbackVariant;
  title: string;
  message: string;
};

const ICONS: Record<AuthFeedbackVariant, IconSymbolName> = {
  success: 'checkmark.circle',
  info: 'envelope.fill',
};

export function AuthFeedback({ variant, title, message }: AuthFeedbackProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const successColor = useThemeColor({}, 'success');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  const iconColor = variant === 'success' ? successColor : brandAccentColor;
  const borderColor = variant === 'success' ? `${Palette.success}40` : Palette.brandAccentBorder;
  const backgroundColor =
    variant === 'success' ? `${Palette.success}12` : Palette.brandAccentSoft;

  return (
    <View
      accessibilityRole="text"
      style={[styles.container, { backgroundColor, borderColor }]}>
      <IconSymbol name={ICONS[variant]} size={22} color={iconColor} style={styles.icon} />
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.message}>
          {message}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  icon: {
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: Spacing.xxs,
  },
  title: {
    ...Typography.body,
    fontWeight: '600',
  },
  message: {
    ...Typography.caption,
  },
});
