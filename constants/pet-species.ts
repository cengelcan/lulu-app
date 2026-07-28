import type { ImageSource } from 'expo-image';

import type { PetSpecies } from '@/types/pet';

export const PET_SPECIES_ICONS: Record<PetSpecies, ImageSource> = {
  cat: require('@/assets/images/pet-icon-cat-v2.png'),
  dog: require('@/assets/images/pet-icon-dog-v2.png'),
};

/** Zoom + offset tuned so species icons read as a head-focused profile photo. */
export const PET_SPECIES_ICON_PORTRAIT_CROP: Record<
  PetSpecies,
  { scale: number; offsetY: number; offsetX: number }
> = {
  cat: { scale: 2, offsetY: -0.05, offsetX: 0 },
  dog: { scale: 1.9, offsetY: -0.03, offsetX: 0 },
};
