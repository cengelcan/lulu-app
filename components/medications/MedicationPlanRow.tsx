import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { MedicationInventory, MedicationPlan } from '@/types/medication';

export function MedicationPlanRow({ plan, inventory, isLast, onPress }: {
  plan: MedicationPlan; inventory?: MedicationInventory | null; isLast: boolean; onPress: () => void;
}) {
  const { t } = useTranslation();
  const secondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${plan.name}, ${plan.dosage} ${plan.unit}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: border },
        { opacity: pressed ? 0.7 : 1 },
      ]}>
      <IconSymbol name="pills.fill" size={22} color={accent} />
      <View style={styles.copy}>
        <ThemedText type="defaultSemiBold" selectable>{plan.name}</ThemedText>
        <ThemedText lightColor={secondary} darkColor={secondary} style={styles.detail} selectable>
          {plan.dosage} {plan.unit}
        </ThemedText>
        {inventory ? (
          <ThemedText style={styles.detail} selectable>
            {inventory.remainingDoses <= inventory.refillThreshold
              ? t('medications.inventory.lowStock', { count: inventory.remainingDoses })
              : t('medications.inventory.stock', { count: inventory.remainingDoses })}
          </ThemedText>
        ) : null}
      </View>
      <IconSymbol name="chevron.right" size={16} color={secondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  detail: { ...Typography.caption },
});
