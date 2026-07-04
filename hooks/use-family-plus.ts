import { FAMILY_SHARING_DEV_BYPASS } from '@/constants/sharing';
import { useUserStore } from '@/stores/user.store';

export function canUseFamilySharing(isPlusActive: boolean): boolean {
  return isPlusActive || FAMILY_SHARING_DEV_BYPASS;
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
