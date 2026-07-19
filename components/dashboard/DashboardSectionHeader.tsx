import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { AccessibilityTokens } from '@/constants/accessibility';
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
  const { fontScale } = useWindowDimensions();
  const usesLargeText = fontScale >= 1.4;
  const accentColorToken = useThemeColor({}, 'accent');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const accentColor = iconColor ?? accentColorToken;

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
    <View style={[styles.container, usesLargeText ? styles.containerLargeText : null]}>
      <View style={[styles.titleRow, usesLargeText ? styles.titleRowLargeText : null]}>
        {icon ? <IconSymbol name={icon} size={18} color={accentColor} /> : null}
        <ThemedText accessibilityRole="header" type="defaultSemiBold" style={styles.title}>
          {title}
        </ThemedText>
      </View>
      {detailLabel ? (
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.detail}>
          {detailLabel}
        </ThemedText>
      ) : null}
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
          onPress={handleActionPress}
          style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText
            lightColor={accentColorToken}
            darkColor={accentColorToken}
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
  containerLargeText: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  titleRowLargeText: {
    flexBasis: '100%',
  },
  title: {
    ...Typography.titleSmall,
  },
  action: {
    ...Typography.caption,
    fontWeight: '600',
  },
  actionButton: {
    minHeight: AccessibilityTokens.minimumTouchTarget,
    justifyContent: 'center',
  },
  detail: {
    ...Typography.caption,
    flexShrink: 1,
    textAlign: 'right',
  },
});
