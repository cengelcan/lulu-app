import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

type ContextualEducationCardProps = {
  title: string;
  description: string;
  icon: IconSymbolName;
  onDismiss: () => void;
};

export function ContextualEducationCard({
  title,
  description,
  icon,
  onDismiss,
}: ContextualEducationCardProps) {
  const { t } = useTranslation();
  const accentColor = useThemeColor({}, 'brandAccent');
  const accentSoft = useThemeColor({}, 'brandAccentSoft');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <Card accessibilityRole="summary" style={styles.card}>
      <View style={[styles.icon, { backgroundColor: accentSoft }]}>
        <IconSymbol name={icon} size={22} color={accentColor} />
      </View>
      <View style={styles.copy}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.description}>
          {description}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('contextualEducation.dismiss')}
          onPress={onDismiss}
          style={({ pressed }) => [styles.dismiss, { opacity: pressed ? 0.65 : 1 }]}>
          <ThemedText
            lightColor={accentColor}
            darkColor={accentColor}
            style={styles.dismissLabel}>
            {t('contextualEducation.dismiss')}
          </ThemedText>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xxs,
  },
  description: {
    ...Typography.caption,
  },
  dismiss: {
    alignSelf: 'flex-start',
    minHeight: 36,
    justifyContent: 'center',
    paddingTop: Spacing.xxs,
  },
  dismissLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
