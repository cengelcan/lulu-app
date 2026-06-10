import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type QuickActionIconName =
  | 'chart.line.uptrend.xyaxis'
  | 'doc.text.fill'
  | 'pills.fill'
  | 'lock.fill';

type QuickActionItemProps = {
  label: string;
  icon: QuickActionIconName;
  locked?: boolean;
  onPress: () => void;
};

export function QuickActionItem({ label, icon, locked = false, onPress }: QuickActionItemProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={locked ? 'Available in a future update' : undefined}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: surfaceColor,
          borderColor,
          opacity: pressed ? 0.85 : locked ? 0.72 : 1,
        },
      ]}>
      <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}1A` }]}>
        <IconSymbol name={icon} size={22} color={primaryColor} />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      {locked ? (
        <View style={styles.lockIcon}>
          <IconSymbol name="lock.fill" size={16} color={textSecondaryColor} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    minWidth: '30%',
    minHeight: 96,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.caption,
    textAlign: 'center',
  },
  lockIcon: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
});
