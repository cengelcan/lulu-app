import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export function ActivityFilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const accent = useThemeColor({}, 'accent');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const primaryText = useThemeColor({}, 'primaryText');

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={() => {
        if (process.env.EXPO_OS === 'ios') {
          void Haptics.selectionAsync();
        }
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? accent : surface,
          borderColor: selected ? accent : border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}>
      <ThemedText
        lightColor={selected ? primaryText : undefined}
        darkColor={selected ? primaryText : undefined}
        style={styles.label}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
