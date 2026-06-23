import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const ICON_BOX_SIZE = 40;
const ICON_SIZE = 20;
const SUCCESS_COLOR = '#3EAD6B';

type CompletedReminderRowProps = {
  title: string;
  typeLabel: string;
  dateLabel: string;
  onPress?: () => void;
  isLast?: boolean;
};

export function CompletedReminderRow({
  title,
  typeLabel,
  dateLabel,
  onPress,
  isLast = false,
}: CompletedReminderRowProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

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
      <View style={[styles.checkCircle, { backgroundColor: `${SUCCESS_COLOR}22` }]}>
        <IconSymbol name="checkmark.circle" size={ICON_SIZE} color={SUCCESS_COLOR} />
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
      {onPress ? <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} /> : null}
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
