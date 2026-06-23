import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type DashboardSectionHeaderProps = {
  title: string;
  icon?: IconSymbolName;
  iconColor?: string;
  detailLabel?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function DashboardSectionHeader({
  title,
  icon,
  iconColor,
  detailLabel,
  actionLabel,
  onActionPress,
}: DashboardSectionHeaderProps) {
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const accentColor = iconColor ?? brandAccentColor;

  const handleActionPress = () => {
    if (!onActionPress) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onActionPress();
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {icon ? <IconSymbol name={icon} size={18} color={accentColor} /> : null}
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {title}
        </ThemedText>
      </View>
      {detailLabel ? (
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.detail}
          numberOfLines={1}>
          {detailLabel}
        </ThemedText>
      ) : null}
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
          onPress={handleActionPress}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText
            lightColor={brandAccentColor}
            darkColor={brandAccentColor}
            style={styles.action}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  title: {
    ...Typography.titleSmall,
  },
  action: {
    ...Typography.caption,
    fontWeight: '600',
  },
  detail: {
    ...Typography.caption,
    flexShrink: 1,
    textAlign: 'right',
  },
});
