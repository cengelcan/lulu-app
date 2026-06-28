import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getCheckInToneColors, type CheckInOptionTone } from '@/constants/check-in-theme';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type CheckInSnapSliderProps<T extends string> = {
  options: { value: T; label: string; tone?: CheckInOptionTone }[];
  value: T | null;
  onChange: (value: T) => void;
};

export function CheckInSnapSlider<T extends string>({
  options,
  value,
  onChange,
}: CheckInSnapSliderProps<T>) {
  const trackColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const selectedIndex = value === null ? -1 : options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
  const selectedToneColors = selectedOption?.tone ? getCheckInToneColors(selectedOption.tone) : null;
  const fillPercent =
    selectedIndex >= 0 ? ((selectedIndex + 1) / options.length) * 100 : 0;

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
      <View style={styles.trackWrapper}>
        <View style={[styles.track, { backgroundColor: trackColor }]}>
          {selectedToneColors ? (
            <View
              style={[
                styles.trackFill,
                {
                  width: `${fillPercent}%`,
                  backgroundColor: selectedToneColors.foreground,
                },
              ]}
            />
          ) : null}
        </View>
        <View style={styles.thumbsOverlay}>
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            const toneColors = option.tone ? getCheckInToneColors(option.tone) : null;

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
                    isSelected &&
                      toneColors && {
                        backgroundColor: toneColors.foreground,
                        transform: [{ scale: 1.2 }],
                      },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.labels}>
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;
          const toneColors = option.tone ? getCheckInToneColors(option.tone) : null;

          return (
            <ThemedText
              key={option.value}
              lightColor={isSelected && toneColors ? toneColors.foreground : textSecondaryColor}
              darkColor={isSelected && toneColors ? toneColors.foreground : textSecondaryColor}
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
  trackWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: Radius.full,
  },
  thumbsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  thumbHitArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
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
