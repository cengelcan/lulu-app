import { useRouter } from 'expo-router';
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
  const router = useRouter();
  const isPlusActive = useUserStore((state) => state.isPlusActive);
  const pets = usePetStore((state) => state.pets);
  const [context, setContext] = useState<PlusFeatureContext>(() => ({
    isPlusActive,
    ownedActivePetCount: countOwnedActivePets(pets),
    recordsThisMonth: 0,
    remindersThisMonth: 0,
  }));

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
    router.push('/paywall');
  }, [router]);

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
    requestAccess,
    refreshLimits,
  };
}
