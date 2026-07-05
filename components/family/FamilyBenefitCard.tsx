import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type FamilyBenefitCardProps = {
  icon: IconSymbolName;
  title: string;
  description: string;
};

export function FamilyBenefitCard({ icon, title, description }: FamilyBenefitCardProps) {
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={[styles.card, { backgroundColor: brandAccentSoft }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${brandAccentColor}22` }]}>
        <IconSymbol name={icon} size={22} color={brandAccentColor} />
      </View>
      <View style={styles.textWrap}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor} style={styles.description}>
          {description}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  description: {
    ...Typography.caption,
  },
});
