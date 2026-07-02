import type { TranslationParams } from '@/i18n/types';
import {
  PET_COLOR_MAX_LENGTH,
  PET_MICROCHIP_MAX_LENGTH,
  PET_NAME_MAX_LENGTH,
  PET_OWNER_MAX_LENGTH,
} from '@/types/pet';

type TranslateFn = (key: string, params?: TranslationParams) => string;

function getValidationParams(key: string): TranslationParams | undefined {
  switch (key) {
    case 'pet.validation.nameMaxLength':
      return { max: PET_NAME_MAX_LENGTH };
    case 'pet.validation.colorMaxLength':
      return { max: PET_COLOR_MAX_LENGTH };
    case 'pet.validation.ownerNameMaxLength':
      return { max: PET_OWNER_MAX_LENGTH };
    case 'pet.validation.microchipMaxLength':
      return { max: PET_MICROCHIP_MAX_LENGTH };
    default:
      return undefined;
  }
}

/** Translates validation error keys; passes through unknown strings unchanged. */
export function translateValidationError(t: TranslateFn, error: string | null): string | null {
  return translateError(t, error);
}

/** Translates store/validation error keys for display in the UI. */
export function translateError(t: TranslateFn, error: string | null): string | null {
  if (!error) {
    return null;
  }

  if (error.startsWith('pet.validation.')) {
    return t(error, getValidationParams(error));
  }

  if (error.startsWith('errors.')) {
    return t(error);
  }

  return error;
}
