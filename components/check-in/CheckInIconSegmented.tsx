import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { CheckInTheme, getCheckInToneColors, type CheckInOptionTone } from '@/constants/check-in-theme';
import { Radius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type CheckInIconSegmentOption<T extends string> = {
  value: T;
  icon: IconSymbolName;
  accessibilityLabel: string;
  tone?: CheckInOptionTone;
};

type CheckInIconSegmentedProps<T extends string> = {
  options: CheckInIconSegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

export function CheckInIconSegmented<T extends string>({
  options,
  value,
  onChange,
}: CheckInIconSegmentedProps<T>) {
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'icon');

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
      accessibilityRole="radiogroup"
      style={[styles.container, { borderColor }]}>
      {options.map((option) => {
        const isSelected = option.value === value;
        const toneColors = option.tone ? getCheckInToneColors(option.tone) : null;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.accessibilityLabel}
            onPress={() => handleSelect(option.value)}
            style={({ pressed }) => [
              styles.segment,
              isSelected && toneColors && { backgroundColor: toneColors.background },
              pressed && !isSelected && styles.segmentPressed,
            ]}>
            <IconSymbol
              name={option.icon}
              size={18}
              color={isSelected && toneColors ? toneColors.foreground : iconColor}
            />
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
    backgroundColor: CheckInTheme.toneNeutralBg,
    padding: Spacing.xxs,
    gap: Spacing.xxs,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  segmentPressed: {
    opacity: 0.7,
  },
});
