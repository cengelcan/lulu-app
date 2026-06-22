import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const ICON_BOX_SIZE = 64;
const ICON_SIZE = 28;

type RecordTypeGridItemProps = {
  label: string;
  icon: IconSymbolName;
  backgroundColor: string;
  onPress: () => void;
};

export function RecordTypeGridItem({
  label,
  icon,
  backgroundColor,
  onPress,
}: RecordTypeGridItemProps) {
  const colorScheme = useColorScheme();
  const primaryColor = useThemeColor({}, 'primary');

  const iconBoxBackground =
    colorScheme === 'dark' ? `${backgroundColor}40` : backgroundColor;

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      style={({ pressed }) => [styles.cell, { opacity: pressed ? 0.75 : 1 }]}>
      <View style={[styles.iconBox, { backgroundColor: iconBoxBackground }]}>
        <IconSymbol name={icon} size={ICON_SIZE} color={primaryColor} />
      </View>
      <ThemedText lightColor={primaryColor} darkColor={primaryColor} style={styles.label}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: '25%',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  iconBox: {
    width: ICON_BOX_SIZE,
    height: ICON_BOX_SIZE,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.caption,
    textAlign: 'center',
  },
});
