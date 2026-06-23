import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const primaryTextColor = useThemeColor({}, 'primaryText');
  const textColor = useThemeColor({}, 'text');

  const handleSelect = (nextValue: T) => {
    if (nextValue === value) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onChange(nextValue);
  };

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.container, { backgroundColor: surfaceColor, borderColor }]}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => handleSelect(option.value)}
            style={({ pressed }) => [
              styles.segment,
              isSelected && { backgroundColor: brandAccentColor },
              pressed && !isSelected && styles.segmentPressed,
            ]}>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={Typography.caption.maxFontSizeMultiplier}
              numberOfLines={1}
              style={[
                styles.label,
                { color: isSelected ? primaryTextColor : textColor },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.xxs,
    gap: Spacing.xxs,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  segmentPressed: {
    opacity: 0.7,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
});
