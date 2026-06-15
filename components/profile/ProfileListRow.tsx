import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type ProfileListRowIconName =
  | 'star.fill'
  | 'square.and.arrow.up'
  | 'camera.fill'
  | 'chevron.right'
  | 'arrow.up.right';

type ProfileListRowProps = {
  label: string;
  icon?: ProfileListRowIconName;
  onPress: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  showExternalIcon?: boolean;
  isLast?: boolean;
  disabled?: boolean;
};

export function ProfileListRow({
  label,
  icon,
  onPress,
  destructive = false,
  showChevron = true,
  showExternalIcon = false,
  isLast = false,
  disabled = false,
}: ProfileListRowProps) {
  const textColor = useThemeColor({}, destructive ? 'alert' : 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, destructive ? 'alert' : 'primary');

  const handlePress = () => {
    if (disabled) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
        { opacity: disabled ? 0.5 : pressed ? 0.7 : 1 },
      ]}>
      {icon ? (
        <View style={styles.leadingIcon}>
          <IconSymbol name={icon} size={20} color={iconColor} />
        </View>
      ) : null}
      <ThemedText
        lightColor={textColor}
        darkColor={textColor}
        type="defaultSemiBold"
        style={styles.label}>
        {label}
      </ThemedText>
      {showExternalIcon ? (
        <IconSymbol name="arrow.up.right" size={16} color={textSecondaryColor} />
      ) : showChevron ? (
        <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  leadingIcon: {
    width: 24,
    alignItems: 'center',
  },
  label: {
    ...Typography.body,
    flex: 1,
  },
});
