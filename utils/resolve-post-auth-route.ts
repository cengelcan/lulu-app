import type { Href } from 'expo-router';

import * as petStorage from '@/storage/pet.storage';
import { resolveAuthenticatedNoPetRoute } from '@/utils/resolve-authenticated-no-pet-route';

export async function resolvePostAuthRoute(): Promise<Href> {
  const hasAnyPet = await petStorage.hasAnyPet();

  if (hasAnyPet) {
    return '/(tabs)/home';
  }

  return resolveAuthenticatedNoPetRoute();
}
