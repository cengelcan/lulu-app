import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const ICON_BOX_SIZE = 40;
const ICON_SIZE = 20;

type ReminderListRowProps = {
  title: string;
  typeLabel: string;
  badgeLabel: string;
  dateLabel: string;
  icon: IconSymbolName;
  backgroundColor: string;
  onPress: () => void;
  isLast?: boolean;
};

export function ReminderListRow({
  title,
  typeLabel,
  badgeLabel,
  dateLabel,
  icon,
  backgroundColor,
  onPress,
  isLast = false,
}: ReminderListRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');

  const iconBoxBackground = isDark ? backgroundColor : `${backgroundColor}22`;
  const iconColor = isDark ? Palette.onDark : backgroundColor;

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

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
      <View style={[styles.statusDot, { backgroundColor: brandAccentColor }]} />
      <View style={[styles.iconBox, { backgroundColor: iconBoxBackground }]}>
        <IconSymbol name={icon} size={ICON_SIZE} color={iconColor} />
      </View>
      <View style={styles.textWrap}>
        <View style={[styles.badge, { backgroundColor: brandAccentSoft }]}>
          <ThemedText
            lightColor={brandAccentColor}
            darkColor={brandAccentColor}
            style={styles.badgeText}>
            {badgeLabel}
          </ThemedText>
        </View>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
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
        style={styles.date}
        numberOfLines={2}>
        {dateLabel}
      </ThemedText>
      <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
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
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginBottom: 2,
  },
  badgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  subtitle: {
    ...Typography.caption,
  },
  date: {
    ...Typography.caption,
    flexShrink: 0,
    textAlign: 'right',
    maxWidth: 96,
  },
});
