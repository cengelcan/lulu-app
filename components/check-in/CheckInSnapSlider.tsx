import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type CheckInSnapSliderProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  accentColor?: string;
};

export function CheckInSnapSlider<T extends string>({
  options,
  value,
  onChange,
  accentColor,
}: CheckInSnapSliderProps<T>) {
  const trackColor = useThemeColor({}, 'border');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const selectedColor = accentColor ?? brandAccentColor;

  const selectedIndex = value === null ? -1 : options.findIndex((option) => option.value === value);

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
    <View accessibilityRole="adjustable" style={styles.container}>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option.label}
              onPress={() => handleSelect(option.value)}
              style={styles.thumbHitArea}>
              <View
                style={[
                  styles.thumb,
                  isSelected && {
                    backgroundColor: selectedColor,
                    transform: [{ scale: 1.2 }],
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
      <View style={styles.labels}>
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;

          return (
            <ThemedText
              key={option.value}
              lightColor={isSelected ? selectedColor : textSecondaryColor}
              darkColor={isSelected ? selectedColor : textSecondaryColor}
              style={[styles.label, isSelected && styles.labelSelected]}
              numberOfLines={1}>
              {option.label}
            </ThemedText>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 4,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
  },
  thumbHitArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    marginTop: -14,
  },
  thumb: {
    width: 14,
    height: 14,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xxs,
  },
  label: {
    ...Typography.caption,
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
  },
  labelSelected: {
    fontWeight: '600',
  },
});
