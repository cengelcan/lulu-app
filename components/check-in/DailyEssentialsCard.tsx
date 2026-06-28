import { StyleSheet, View } from 'react-native';

import { CheckInIconSegmented } from '@/components/check-in/CheckInIconSegmented';
import { CheckInSnapSlider } from '@/components/check-in/CheckInSnapSlider';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  CHECK_IN_CATEGORIES,
  CHECK_IN_OPTIONS_BY_CATEGORY,
} from '@/constants/check-in';
import { CheckInTheme } from '@/constants/check-in-theme';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { CheckInCategory, CheckInFormState } from '@/types/check-in';
import { getCheckInOptionTone } from '@/utils/check-in';

const SEGMENTED_CATEGORIES = CHECK_IN_CATEGORIES.filter((category) => category.controlType === 'segmented');
const SLIDER_CATEGORIES = CHECK_IN_CATEGORIES.filter((category) => category.controlType === 'slider');

type MetricCardProps = {
  children: React.ReactNode;
};

function MetricCard({ children }: MetricCardProps) {
  return <View style={styles.metricCard}>{children}</View>;
}

type CheckInMetricRowProps = {
  category: (typeof CHECK_IN_CATEGORIES)[number];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function SegmentedMetricRow({ category, value, onChange, disabled = false }: CheckInMetricRowProps) {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const categoryLabel = t(category.translationKey);
  const rawOptions = CHECK_IN_OPTIONS_BY_CATEGORY[category.key];
  const options = rawOptions.map((option) => ({
    value: option.value,
    icon: option.icon,
    label: t(`${category.optionsTranslationKey}.${option.value}`),
    accessibilityLabel: `${categoryLabel}, ${t(`${category.optionsTranslationKey}.${option.value}`)}`,
    tone: getCheckInOptionTone(category.key, option.value),
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
    <View style={styles.segmentedContent}>
      <View style={styles.titleRow}>
        <View style={[styles.iconCircle, { backgroundColor: `${category.iconColor}22` }]}>
          <IconSymbol name={category.icon} size={20} color={category.iconColor} />
        </View>
        <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={1}>
          {categoryLabel}
        </ThemedText>
      </View>

      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.status}
        numberOfLines={1}>
        {statusText}
      </ThemedText>

      <CheckInIconSegmented
        options={options}
        value={value as (typeof options)[number]['value'] | null}
        onChange={handleChange}
      />
    </View>
  );
}

function SliderMetricRow({ category, value, onChange, disabled = false }: CheckInMetricRowProps) {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const categoryLabel = t(category.translationKey);
  const rawOptions = CHECK_IN_OPTIONS_BY_CATEGORY[category.key];
  const options = rawOptions.map((option) => ({
    value: option.value,
    icon: option.icon,
    label: t(`${category.optionsTranslationKey}.${option.value}`),
    accessibilityLabel: `${categoryLabel}, ${t(`${category.optionsTranslationKey}.${option.value}`)}`,
    tone: getCheckInOptionTone(category.key, option.value),
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
    <View style={styles.sliderContent}>
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
            numberOfLines={1}>
            {statusText}
          </ThemedText>
        </View>
      </View>

      <CheckInSnapSlider
        options={options.map((option) => ({
          value: option.value,
          label: option.label,
          tone: option.tone,
        }))}
        value={value as (typeof options)[number]['value'] | null}
        onChange={handleChange}
      />
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
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <IconSymbol name="doc.text.fill" size={18} color={brandAccentColor} />
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          {t('checkIn.dailyEssentials')}
        </ThemedText>
      </View>

      <View style={styles.cards}>
        {SEGMENTED_CATEGORIES.map((category) => (
          <MetricCard key={category.key}>
            <SegmentedMetricRow
              category={category}
              value={formValues[category.key]}
              onChange={(nextValue) => onCategoryChange(category.key, nextValue)}
              disabled={disabled}
            />
          </MetricCard>
        ))}

        {SLIDER_CATEGORIES.map((category) => (
          <MetricCard key={category.key}>
            <SliderMetricRow
              category={category}
              value={formValues[category.key]}
              onChange={(nextValue) => onCategoryChange(category.key, nextValue)}
              disabled={disabled}
            />
          </MetricCard>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.subtitle,
  },
  cards: {
    gap: Spacing.sm,
  },
  metricCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CheckInTheme.glassBorder,
    backgroundColor: CheckInTheme.glassSurface,
    padding: Spacing.md,
  },
  segmentedContent: {
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.bodySemiBold,
    flex: 1,
  },
  status: {
    ...Typography.caption,
  },
  sliderContent: {
    gap: Spacing.lg,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  textBlock: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
});
