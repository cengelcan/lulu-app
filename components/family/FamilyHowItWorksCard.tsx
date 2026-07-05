import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type FamilyHowItWorksCardProps = {
  title: string;
  steps: string[];
};

export function FamilyHowItWorksCard({ title, steps }: FamilyHowItWorksCardProps) {
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={[styles.card, { backgroundColor: surfaceColor }]}>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        {title}
      </ThemedText>
      <View style={styles.steps}>
        {steps.map((step) => (
          <View key={step} style={styles.stepRow}>
            <IconSymbol name="checkmark.circle.fill" size={18} color={brandAccentColor} />
            <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor} style={styles.stepText}>
              {step}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    ...Typography.body,
  },
  steps: {
    gap: Spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepText: {
    flex: 1,
    ...Typography.body,
  },
});
