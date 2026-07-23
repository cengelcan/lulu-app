import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { InboxItem } from '@/types/inbox';
import { getInboxItemIcon } from '@/utils/inbox/inbox-item-icon';

type InboxItemRowProps = {
  item: InboxItem;
  showPetName: boolean;
  isLast?: boolean;
  onPress: (item: InboxItem) => void;
};

export function InboxItemRow({ item, showPetName, isLast = false, onPress }: InboxItemRowProps) {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const accentColorToken = useThemeColor({}, 'accent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const warningColor = useThemeColor({}, 'warning');

  const isUrgent = item.priority === 'urgent';
  const isImportantActivity =
    item.source === 'family' && item.category === 'activity' && item.priority === 'normal';
  const usesWarningAccent = isUrgent || isImportantActivity;
  const accentColor = usesWarningAccent ? warningColor : accentColorToken;
  const iconBackground = usesWarningAccent ? `${warningColor}22` : brandAccentSoft;
  const title = t(item.titleKey, item.titleParams);
  const subtitle = item.subtitleText ??
    (item.subtitleKey ? t(item.subtitleKey, item.subtitleParams) : null);

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress(item);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
        { opacity: pressed ? 0.7 : 1 },
      ]}>
      <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>
        <IconSymbol name={getInboxItemIcon(item.kind)} size={20} color={accentColor} />
      </View>
      <View style={styles.textWrap}>
        {item.isUnread ? (
          <View
            accessibilityLabel={t('familyActivity.unread')}
            style={[styles.unreadDot, { backgroundColor: accentColor }]}
          />
        ) : null}
        {showPetName && item.petName ? (
          <ThemedText
            lightColor={accentColor}
            darkColor={accentColor}
            style={styles.petName}>
            {item.petName}
          </ThemedText>
        ) : null}
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        {item.actorDisplayName && item.source === 'family' ? (
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.actorName}>
            {item.actorDisplayName}
          </ThemedText>
        ) : null}
        {subtitle ? (
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
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
  unreadDot: {
    position: 'absolute',
    right: 0,
    top: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  petName: {
    ...Typography.caption,
    fontWeight: '600',
  },
  actorName: {
    ...Typography.caption,
  },
  subtitle: {
    ...Typography.caption,
  },
});
