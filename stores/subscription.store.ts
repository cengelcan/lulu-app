import { create } from 'zustand';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

import {
  fetchOfferings,
  isRevenueCatAvailable,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
} from '@/services/subscription/revenuecat';
import { refreshSubscriptionStatus } from '@/services/subscription/lifecycle';
import { useUserStore } from '@/stores/user.store';

type SubscriptionState = {
  offerings: PurchasesOffering | null;
  isLoading: boolean;
  error: string | null;
  loadOfferings: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
  clearError: () => void;
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  offerings: null,
  isLoading: false,
  error: null,

  loadOfferings: async () => {
    if (!isRevenueCatAvailable()) {
      set({ offerings: null });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const offerings = await fetchOfferings();
      set({ offerings, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'errors.unknown',
      });
    }
  },

  purchasePackage: async (pkg) => {
    set({ isLoading: true, error: null });

    try {
      const status = await purchaseRevenueCatPackage(pkg);
      useUserStore.setState({
        isPlusActive: status.isPlusActive,
        plusExpiresAt: status.plusExpiresAt,
      });
      set({ isLoading: false });
      await refreshSubscriptionStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'errors.unknown';

      // User cancelled — not an error state.
      if (message.includes('Purchase was cancelled')) {
        set({ isLoading: false });
        return;
      }

      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  restorePurchases: async () => {
    set({ isLoading: true, error: null });

    try {
      const status = await restoreRevenueCatPurchases();
      useUserStore.setState({
        isPlusActive: status.isPlusActive,
        plusExpiresAt: status.plusExpiresAt,
      });
      set({ isLoading: false });
      await refreshSubscriptionStatus();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'errors.unknown',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
