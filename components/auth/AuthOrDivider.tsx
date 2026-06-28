import { StyleSheet, Text, View } from 'react-native';

import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

export function AuthOrDivider() {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={styles.row}>
      <View style={[styles.line, { backgroundColor: borderColor }]} />
      <Text allowFontScaling style={[styles.label, { color: textSecondaryColor }]}>
        {t('auth.orDivider')}
      </Text>
      <View style={[styles.line, { backgroundColor: borderColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  label: {
    ...Typography.caption,
  },
});
