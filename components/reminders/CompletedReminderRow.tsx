import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const ICON_BOX_SIZE = 40;
const ICON_SIZE = 20;

type CompletedReminderRowProps = {
  title: string;
  typeLabel: string;
  dateLabel: string;
  icon: IconSymbolName;
  backgroundColor: string;
  onPress?: () => void;
  isLast?: boolean;
};

export function CompletedReminderRow({
  title,
  typeLabel,
  dateLabel,
  icon,
  backgroundColor,
  onPress,
  isLast = false,
}: CompletedReminderRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const successColor = '#3EAD6B';

  const iconBoxBackground = isDark ? backgroundColor : `${backgroundColor}22`;
  const iconColor = isDark ? Palette.onDark : backgroundColor;

  const handlePress = () => {
    if (!onPress) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const content = (
    <>
      <View style={[styles.checkCircle, { backgroundColor: `${successColor}22` }]}>
        <IconSymbol name="checkmark.circle" size={ICON_SIZE} color={successColor} />
      </View>
      <View style={[styles.iconBox, { backgroundColor: iconBoxBackground }]}>
        <IconSymbol name={icon} size={ICON_SIZE} color={iconColor} />
      </View>
      <View style={styles.textWrap}>
        <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.completedTitle}>
          {title}
        </ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          numberOfLines={1}
          style={styles.subtitle}>
          {typeLabel}
        </ThemedText>
      </View>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.date}>
        {dateLabel}
      </ThemedText>
    </>
  );

  if (!onPress) {
    return (
      <View
        style={[
          styles.row,
          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
        ]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${dateLabel}`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
        { opacity: pressed ? 0.7 : 1 },
      ]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  checkCircle: {
    width: ICON_BOX_SIZE,
    height: ICON_BOX_SIZE,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBox: {
    width: ICON_BOX_SIZE,
    height: ICON_BOX_SIZE,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  completedTitle: {
    opacity: 0.7,
  },
  subtitle: {
    ...Typography.caption,
  },
  date: {
    ...Typography.caption,
    flexShrink: 0,
  },
});
