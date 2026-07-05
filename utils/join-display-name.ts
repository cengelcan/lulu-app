import { useUserStore } from '@/stores/user.store';

export function needsDisplayNameForJoin(
  provider: string | null | undefined,
  displayName: string | null | undefined
): boolean {
  if (provider !== 'email') {
    return false;
  }

  return !displayName?.trim();
}

export function needsDisplayNameForJoinFromStore(): boolean {
  const { provider, displayName } = useUserStore.getState();
  return needsDisplayNameForJoin(provider, displayName);
}
