import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { IconSymbolName } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type CheckInOptionCardProps = {
  label: string;
  icon: IconSymbolName;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
};

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 220,
};

export function CheckInOptionCard({
  label,
  icon,
  selected,
  onPress,
  accessibilityLabel,
}: CheckInOptionCardProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentGlowColor = useThemeColor({}, 'brandAccentGlow');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'icon');

  const scale = useSharedValue(selected ? 1 : 0.92);
  const translateY = useSharedValue(selected ? -4 : 0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      scale.value = selected ? 1 : 0.96;
      translateY.value = selected ? -2 : 0;
      return;
    }

    scale.value = withSpring(selected ? 1 : 0.92, SPRING_CONFIG);
    translateY.value = withSpring(selected ? -4 : 0, SPRING_CONFIG);
  }, [reduceMotion, scale, selected, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={accessibilityLabel}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: surfaceColor,
            borderColor: selected ? brandAccentColor : borderColor,
            borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
            opacity: pressed ? 0.9 : selected ? 1 : 0.82,
            shadowColor: selected ? brandAccentGlowColor : '#000000',
            shadowOpacity: selected ? 1 : 0,
            elevation: selected ? 4 : 0,
          },
        ]}>
        <IconSymbol
          name={icon}
          size={28}
          color={selected ? brandAccentColor : iconColor}
          style={styles.icon}
        />
        <ThemedText
          type="defaultSemiBold"
          lightColor={selected ? textColor : textSecondaryColor}
          darkColor={selected ? textColor : textSecondaryColor}
          style={styles.label}
          numberOfLines={2}>
          {label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 112,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  icon: {
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.bodySemiBold,
    textAlign: 'center',
  },
});
