import { StyleSheet, View } from 'react-native';

import { SnapOptionCarousel } from '@/components/check-in/SnapOptionCarousel';
import { ThemedText } from '@/components/themed-text';
import { CHECK_IN_OPTIONS_BY_CATEGORY } from '@/constants/check-in';
import { Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import type { CheckInCategory } from '@/types/check-in';

type CheckInCategorySectionProps<T extends string> = {
  emoji: string;
  category: CheckInCategory;
  titleTranslationKey: string;
  optionsTranslationKey: string;
  selected: T | null;
  onSelect: (value: T) => void;
};

export function CheckInCategorySection<T extends string>({
  emoji,
  category,
  titleTranslationKey,
  optionsTranslationKey,
  selected,
  onSelect,
}: CheckInCategorySectionProps<T>) {
  const { t } = useTranslation();
  const categoryLabel = t(titleTranslationKey);
  const rawOptions = CHECK_IN_OPTIONS_BY_CATEGORY[category];

  const options = rawOptions.map((option) => ({
    value: option.value as T,
    icon: option.icon,
    label: t(`${optionsTranslationKey}.${option.value}`),
  }));

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.title}>
        {emoji} {categoryLabel}
      </ThemedText>
      <SnapOptionCarousel
        options={options}
        selected={selected}
        onSelect={onSelect}
        categoryLabel={categoryLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  title: {
    ...Typography.subtitle,
  },
});
