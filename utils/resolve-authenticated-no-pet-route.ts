import type { Href } from 'expo-router';

import { getPendingFamilyJoinCode } from '@/storage/pending-family-join.storage';
import { getUserSetupPath } from '@/storage/setup-path.storage';
import { useSetupStore } from '@/stores/setup.store';
import { useUserStore } from '@/stores/user.store';
import { needsDisplayNameForJoinFromStore } from '@/utils/join-display-name';

async function resolveJoinFamilyRoute(): Promise<Href> {
  if (needsDisplayNameForJoinFromStore()) {
    return '/(setup)/join-display-name' as Href;
  }

  const pendingCode = await getPendingFamilyJoinCode();

  if (pendingCode) {
    return `/join-family?code=${pendingCode}` as Href;
  }

  return '/join-family' as Href;
}

export async function resolveAuthenticatedNoPetRoute(): Promise<Href> {
  const pendingCode = await getPendingFamilyJoinCode();

  if (pendingCode) {
    await useUserStore.getState().loadUserProfile();
    return resolveJoinFamilyRoute();
  }

  const setupPath = await getUserSetupPath();

  if (setupPath === 'join_family') {
    await useUserStore.getState().loadUserProfile();
    return resolveJoinFamilyRoute();
  }

  if (setupPath === 'owner') {
    useSetupStore.getState().beginSetup('initial');
    return '/(setup)/pet-type' as Href;
  }

  return '/(setup)/path-choice' as Href;
}
