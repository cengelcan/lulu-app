import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { HealthCondition } from '@/types/pet';
import { buildHealthConditionSummary } from '@/utils/pet-health-summary';

type HealthConditionChipsProps = {
  conditions: HealthCondition[];
  getLabel: (condition: HealthCondition) => string;
};

export function HealthConditionChips({
  conditions,
  getLabel,
}: HealthConditionChipsProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const brandAccentBorder = useThemeColor({}, 'brandAccentBorder');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const summary = useMemo(
    () => buildHealthConditionSummary(conditions, expanded),
    [conditions, expanded]
  );
  const activeCount = conditions.filter((condition) => condition !== 'none').length;

  if (activeCount === 0) {
    return (
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.empty}>
        {t('pet.none')}
      </ThemedText>
    );
  }

  return (
    <View style={styles.wrap}>
      {summary.visible.map((condition) => (
        <View
          key={condition}
          style={[
            styles.chip,
            { backgroundColor: brandAccentSoft, borderColor: brandAccentBorder },
          ]}>
          <ThemedText
            lightColor={brandAccentColor}
            darkColor={brandAccentColor}
            style={styles.chipLabel}>
            {getLabel(condition)}
          </ThemedText>
        </View>
      ))}

      {summary.hiddenCount > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('pet.showMoreConditionsA11y', {
            count: summary.hiddenCount,
          })}
          onPress={() => setExpanded(true)}
          style={({ pressed }) => [
            styles.controlChip,
            { borderColor: brandAccentBorder, opacity: pressed ? 0.65 : 1 },
          ]}>
          <ThemedText style={styles.controlLabel}>
            {t('pet.moreConditions', { count: summary.hiddenCount })}
          </ThemedText>
        </Pressable>
      ) : expanded && activeCount > 3 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('pet.showFewerConditionsA11y')}
          onPress={() => setExpanded(false)}
          style={({ pressed }) => [
            styles.controlChip,
            { borderColor: brandAccentBorder, opacity: pressed ? 0.65 : 1 },
          ]}>
          <ThemedText style={styles.controlLabel}>{t('pet.showLess')}</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chipLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
  controlChip: {
    minHeight: 36,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  controlLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
  empty: {
    ...Typography.body,
  },
});
