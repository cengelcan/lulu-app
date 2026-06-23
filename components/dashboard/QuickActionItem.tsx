import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type QuickActionItemProps = {
  label: string;
  subtitle: string;
  icon: IconSymbolName;
  iconTint?: 'primary' | 'warning';
  onPress: () => void;
};

export function QuickActionItem({
  label,
  subtitle,
  icon,
  iconTint = 'primary',
  onPress,
}: QuickActionItemProps) {
  const warningColor = useThemeColor({}, 'warning');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');

  const accentColor = iconTint === 'warning' ? warningColor : brandAccentColor;
  const iconBackground = iconTint === 'warning' ? `${warningColor}1A` : brandAccentSoft;

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${subtitle}`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: surfaceColor,
          borderColor,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={[styles.iconContainer, { backgroundColor: iconBackground }]}>
        <IconSymbol name={icon} size={20} color={accentColor} />
      </View>
      <View style={styles.textWrap}>
        <ThemedText type="defaultSemiBold" style={styles.label} numberOfLines={1}>
          {label}
        </ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.subtitle}
          numberOfLines={2}>
          {subtitle}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    minHeight: 108,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
    width: '100%',
  },
  label: {
    ...Typography.caption,
    fontSize: 14,
  },
  subtitle: {
    ...Typography.caption,
    fontSize: 11,
    lineHeight: 14,
  },
});
