import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

type RecordAttachmentPlaceholderProps = {
  onPress: () => void;
};

export function RecordAttachmentPlaceholder({ onPress }: RecordAttachmentPlaceholderProps) {
  const { t } = useTranslation();
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: surfaceColor,
          borderColor,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: `${primaryColor}1A` }]}>
        <IconSymbol name="camera.fill" size={22} color={primaryColor} />
      </View>
      <View style={styles.textWrap}>
        <ThemedText type="defaultSemiBold">{t('records.attachment.title')}</ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.subtitle}>
          {t('records.attachment.subtitle')}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    ...Typography.caption,
  },
});
