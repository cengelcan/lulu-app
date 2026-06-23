import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

const ICON_BOX_SIZE = 64;
const ICON_SIZE = 28;

type ReminderTypeGridItemProps = {
  label: string;
  subtitle?: string;
  icon: IconSymbolName;
  backgroundColor: string;
  onPress: () => void;
  variant?: 'grid' | 'banner';
};

export function ReminderTypeGridItem({
  label,
  subtitle,
  icon,
  backgroundColor,
  onPress,
  variant = 'grid',
}: ReminderTypeGridItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const iconBoxBackground = isDark ? backgroundColor : `${backgroundColor}22`;
  const iconColor = isDark ? Palette.onDark : backgroundColor;

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  if (variant === 'banner') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={handlePress}
        style={({ pressed }) => [styles.bannerCell, { opacity: pressed ? 0.75 : 1 }]}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: iconBoxBackground },
            isDark && {
              shadowColor: backgroundColor,
              shadowOpacity: 0.45,
            },
          ]}>
          <IconSymbol name={icon} size={ICON_SIZE} color={iconColor} />
        </View>
        <View style={styles.bannerText}>
          <ThemedText style={styles.bannerLabel} numberOfLines={1}>
            {label}
          </ThemedText>
          {subtitle ? (
            <ThemedText style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      style={({ pressed }) => [styles.gridCell, { opacity: pressed ? 0.75 : 1 }]}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: iconBoxBackground },
          isDark && {
            shadowColor: backgroundColor,
            shadowOpacity: 0.45,
          },
        ]}>
        <IconSymbol name={icon} size={ICON_SIZE} color={iconColor} />
      </View>
      <ThemedText style={styles.label} numberOfLines={2}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gridCell: {
    width: '25%',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  bannerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  iconBox: {
    width: ICON_BOX_SIZE,
    height: ICON_BOX_SIZE,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 4,
    flexShrink: 0,
  },
  bannerText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  label: {
    ...Typography.caption,
    textAlign: 'center',
    fontWeight: '600',
  },
  bannerLabel: {
    ...Typography.caption,
    textAlign: 'left',
    fontWeight: '600',
  },
  subtitle: {
    ...Typography.caption,
    fontSize: 11,
    lineHeight: 14,
    opacity: 0.75,
  },
});
