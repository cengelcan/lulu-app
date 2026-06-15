import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type QuickActionIconName = 'chart.line.uptrend.xyaxis' | 'doc.text.fill' | 'pills.fill';

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
      accessibilityHint={locked ? 'Coming soon' : undefined}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: surfaceColor,
          borderColor,
          opacity: pressed ? 0.85 : locked ? 0.88 : 1,
        },
      ]}>
      {locked ? (
        <View style={[styles.badge, { backgroundColor: `${primaryColor}1A` }]}>
          <ThemedText
            lightColor={primaryColor}
            darkColor={primaryColor}
            maxFontSizeMultiplier={1.2}
            style={styles.badgeText}>
            Coming Soon
          </ThemedText>
        </View>
      ) : null}
      <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}1A` }]}>
        <IconSymbol
          name={icon}
          size={22}
          color={locked ? textSecondaryColor : primaryColor}
        />
      </View>
      <ThemedText
        type="defaultSemiBold"
        lightColor={locked ? textSecondaryColor : undefined}
        darkColor={locked ? textSecondaryColor : undefined}
        style={styles.label}>
        {label}
      </ThemedText>
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
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    alignSelf: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: '600',
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
});
