import type { ImageSource } from 'expo-image';

import type { PetSpecies } from '@/types/pet';

export const PET_SPECIES_ICONS: Record<PetSpecies, ImageSource> = {
  cat: require('@/assets/images/pet-icon-cat.png'),
  dog: require('@/assets/images/pet-icon-dog.png'),
};

/** Zoom + offset tuned so species icons read as a head-focused profile photo. */
export const PET_SPECIES_ICON_PORTRAIT_CROP: Record<
  PetSpecies,
  { scale: number; offsetY: number; offsetX: number }
> = {
  cat: { scale: 1.1, offsetY: 0.16, offsetX: 0 },
  dog: { scale: 1.1, offsetY: 0.16, offsetX: 0 },
};
