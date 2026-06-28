import {
  CHECK_IN_CATEGORIES,
  CHECK_IN_NORMAL_VALUES,
  CHECK_IN_OPTIONS_BY_CATEGORY,
} from '@/constants/check-in';
import type { CheckIn, CheckInCategory, CheckInFormState, CheckInFormValues } from '@/types/check-in';

export function isCheckInFormComplete(values: CheckInFormState): values is CheckInFormValues {
  return (
    values.appetite !== null &&
    values.appetite !== undefined &&
    values.waterIntake !== null &&
    values.waterIntake !== undefined &&
    values.energy !== null &&
    values.energy !== undefined &&
    values.mood !== null &&
    values.mood !== undefined &&
    values.pee !== null &&
    values.pee !== undefined &&
    values.poop !== null &&
    values.poop !== undefined
  );
}

export function countCompletedCheckInFields(values: CheckInFormState): number {
  let count = 0;

  for (const category of CHECK_IN_CATEGORIES) {
    const value = values[category.key];
    if (value !== null && value !== undefined) {
      count += 1;
    }
  }

  return count;
}

export type AbnormalCheckInField = {
  category: CheckInCategory;
  categoryTranslationKey: string;
  value: string;
  valueTranslationKey: string;
};

export function getAbnormalCheckInFields(checkIn: CheckIn): AbnormalCheckInField[] {
  const abnormal: AbnormalCheckInField[] = [];

  for (const category of CHECK_IN_CATEGORIES) {
    const value = checkIn[category.key];
    const normalValue = CHECK_IN_NORMAL_VALUES[category.key];

    if (value !== normalValue) {
      abnormal.push({
        category: category.key,
        categoryTranslationKey: category.translationKey,
        value,
        valueTranslationKey: `${category.optionsTranslationKey}.${value}`,
      });
    }
  }

  return abnormal;
}

export function getAbnormalCheckInFieldsFromForm(values: CheckInFormState): AbnormalCheckInField[] {
  if (!isCheckInFormComplete(values)) {
    return [];
  }

  return getAbnormalCheckInFields({
    id: '',
    petId: '',
    date: '',
    createdAt: '',
    ...values,
  });
}

export function getCheckInCategoryOptions(category: CheckInCategory) {
  return CHECK_IN_OPTIONS_BY_CATEGORY[category];
}
