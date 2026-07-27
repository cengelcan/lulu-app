import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { BrandGradientFill } from '@/components/ui/BrandGradient';
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
  const { fontScale } = useWindowDimensions();
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const primaryTextColor = useThemeColor({}, 'primaryText');
  const textColor = useThemeColor({}, 'text');
  const usesVerticalLayout = fontScale >= 1.3;

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
      style={[
        styles.container,
        usesVerticalLayout && styles.containerVertical,
        { backgroundColor: surfaceColor, borderColor },
      ]}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityLabel={option.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => handleSelect(option.value)}
            style={({ pressed }) => [
              styles.segment,
              usesVerticalLayout && styles.segmentVertical,
              isSelected && styles.segmentSelected,
              pressed && !isSelected && styles.segmentPressed,
              pressed && isSelected && styles.segmentSelectedPressed,
            ]}>
            {isSelected ? <BrandGradientFill /> : null}
            <Text
              allowFontScaling
              maxFontSizeMultiplier={Typography.caption.maxFontSizeMultiplier}
              numberOfLines={usesVerticalLayout ? undefined : 1}
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
  containerVertical: {
    flexDirection: 'column',
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
  segmentVertical: {
    width: '100%',
  },
  segmentSelected: {
    overflow: 'hidden',
  },
  segmentSelectedPressed: {
    opacity: 0.85,
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
