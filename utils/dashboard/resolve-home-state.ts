import type { Pet } from '@/types/pet';

export type HomeState = 'no_pet' | 'new' | 'active' | 'memorial' | 'shared';

type ResolveHomeStateInput = {
  pet: Pet | null;
  hasCareData: boolean;
};

export function resolveHomeState({ pet, hasCareData }: ResolveHomeStateInput): HomeState {
  if (!pet) {
    return 'no_pet';
  }

  if (pet.status === 'deceased') {
    return 'memorial';
  }

  if (pet.sharingRole === 'member') {
    return 'shared';
  }

  return hasCareData ? 'active' : 'new';
}
