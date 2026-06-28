import type { ImageSource } from 'expo-image';

import type { PetSpecies } from '@/types/pet';

export const PET_SPECIES_ICONS: Record<PetSpecies, ImageSource> = {
  cat: require('@/assets/images/pet-icon-cat.png'),
  dog: require('@/assets/images/pet-icon-dog.png'),
};
