import { StyleSheet, View } from 'react-native';

import { CheckInIconSegmented } from '@/components/check-in/CheckInIconSegmented';
import { CheckInSnapSlider } from '@/components/check-in/CheckInSnapSlider';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  CHECK_IN_CATEGORIES,
  CHECK_IN_OPTIONS_BY_CATEGORY,
} from '@/constants/check-in';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { CheckInCategory, CheckInFormState } from '@/types/check-in';

type CheckInMetricRowProps = {
  category: (typeof CHECK_IN_CATEGORIES)[number];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function CheckInMetricRow({ category, value, onChange, disabled = false }: CheckInMetricRowProps) {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const categoryLabel = t(category.translationKey);
  const rawOptions = CHECK_IN_OPTIONS_BY_CATEGORY[category.key];
  const options = rawOptions.map((option) => ({
    value: option.value,
    icon: option.icon,
    label: t(`${category.optionsTranslationKey}.${option.value}`),
    accessibilityLabel: `${categoryLabel}, ${t(`${category.optionsTranslationKey}.${option.value}`)}`,
  }));

  const statusText =
    value !== null
      ? t(`${category.statusTranslationKey}.${value}`)
      : t('checkIn.progressCard.inProgressSubtitle');

  const handleChange = (nextValue: string) => {
    if (disabled) {
      return;
    }
    onChange(nextValue);
  };

  return (
    <View style={[styles.row, category.controlType === 'segmented' && styles.rowSegmented]}>
      <View style={styles.left}>
        <View style={[styles.iconCircle, { backgroundColor: `${category.iconColor}22` }]}>
          <IconSymbol name={category.icon} size={20} color={category.iconColor} />
        </View>
        <View style={styles.textBlock}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {categoryLabel}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.status}
            numberOfLines={2}>
            {statusText}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.control, category.controlType === 'segmented' && styles.controlSegmented]}>
        {category.controlType === 'segmented' ? (
          <CheckInIconSegmented
            options={options}
            value={value as (typeof options)[number]['value'] | null}
            onChange={handleChange}
            accentColor={category.iconColor}
          />
        ) : (
          <CheckInSnapSlider
            options={options.map((option) => ({ value: option.value, label: option.label }))}
            value={value as (typeof options)[number]['value'] | null}
            onChange={handleChange}
            accentColor={category.iconColor}
          />
        )}
      </View>
    </View>
  );
}

type DailyEssentialsCardProps = {
  formValues: CheckInFormState;
  onCategoryChange: (category: CheckInCategory, value: string) => void;
  disabled?: boolean;
};

export function DailyEssentialsCard({
  formValues,
  onCategoryChange,
  disabled = false,
}: DailyEssentialsCardProps) {
  const { t } = useTranslation();
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  return (
    <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <IconSymbol name="doc.text.fill" size={18} color={brandAccentColor} />
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            {t('checkIn.dailyEssentials')}
          </ThemedText>
        </View>
      </View>

      <View style={styles.metrics}>
        {CHECK_IN_CATEGORIES.map((category) => (
          <CheckInMetricRow
            key={category.key}
            category={category}
            value={formValues[category.key]}
            onChange={(nextValue) => onCategoryChange(category.key, nextValue)}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.subtitle,
  },
  metrics: {
    gap: Spacing.xl,
  },
  row: {
    gap: Spacing.md,
  },
  rowSegmented: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.bodySemiBold,
  },
  status: {
    ...Typography.caption,
  },
  control: {
    width: '100%',
  },
  controlSegmented: {
    width: 148,
    flexShrink: 0,
  },
});
