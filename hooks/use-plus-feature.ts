import { useCallback, useEffect, useMemo, useState } from 'react';

import { type PlusFeature } from '@/constants/subscription';
import { usePetStore } from '@/stores/pet.store';
import { useUserStore } from '@/stores/user.store';
import {
  buildPlusFeatureContext,
  countOwnedActivePets,
  evaluatePlusFeature,
  isPlusEntitled,
  type PlusFeatureContext,
} from '@/utils/subscription-limits';

export function usePlusFeature(feature: PlusFeature) {
  const isPlusActive = useUserStore((state) => state.isPlusActive);
  const pets = usePetStore((state) => state.pets);
  const [context, setContext] = useState<PlusFeatureContext>(() => ({
    isPlusActive,
    ownedActivePetCount: countOwnedActivePets(pets),
    recordsThisMonth: 0,
    remindersThisMonth: 0,
  }));
  const [paywallVisible, setPaywallVisible] = useState(false);

  const ownedActivePetCount = useMemo(() => countOwnedActivePets(pets), [pets]);

  useEffect(() => {
    let cancelled = false;

    void buildPlusFeatureContext(isPlusActive, pets).then((nextContext) => {
      if (!cancelled) {
        setContext(nextContext);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isPlusActive, pets, ownedActivePetCount]);

  const allowed = useMemo(
    () =>
      evaluatePlusFeature(feature, {
        ...context,
        ownedActivePetCount,
      }),
    [context, feature, ownedActivePetCount]
  );

  const requestAccess = useCallback(() => {
    setPaywallVisible(true);
  }, []);

  const dismissPaywall = useCallback(() => {
    setPaywallVisible(false);
  }, []);

  const refreshLimits = useCallback(async () => {
    const nextContext = await buildPlusFeatureContext(isPlusActive, pets);
    setContext(nextContext);
  }, [isPlusActive, pets]);

  return {
    allowed,
    isPlusActive: isPlusEntitled(isPlusActive),
    ownedActivePetCount,
    recordsThisMonth: context.recordsThisMonth,
    remindersThisMonth: context.remindersThisMonth,
    paywallVisible,
    requestAccess,
    dismissPaywall,
    refreshLimits,
  };
}
