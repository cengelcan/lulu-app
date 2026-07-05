import { PLUS_DEV_BYPASS } from '@/constants/subscription';
import { useUserStore } from '@/stores/user.store';
import { isPlusEntitled } from '@/utils/subscription-limits';

export function canUseFamilySharing(isPlusActive: boolean): boolean {
  return isPlusEntitled(isPlusActive);
}

export function useFamilyPlusAccess(): {
  isPlusActive: boolean;
  canUseFamilySharing: boolean;
} {
  const isPlusActive = useUserStore((state) => state.isPlusActive);

  return {
    isPlusActive,
    canUseFamilySharing: canUseFamilySharing(isPlusActive),
  };
}
