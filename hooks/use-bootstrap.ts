import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getNotificationLaunchRoute, syncCheckInReminderSchedule, syncPetReminderNotificationSchedule } from '@/services/notifications';
import * as petStorage from '@/storage/pet.storage';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { usePetStore } from '@/stores/pet.store';
import { useUserStore } from '@/stores/user.store';

export type BootstrapPhase = 'loading' | 'error' | 'redirecting';

/** PRD Screen 01 — minimum splash visibility before navigation */
export const SPLASH_MIN_DURATION_MS = 1000;

function resolveBootstrapRoute(
  hasCompletedOnboarding: boolean,
  isAuthenticated: boolean,
  hasAnyPet: boolean
): Href {
  if (!hasCompletedOnboarding) {
    return '/welcome';
  }

  if (!isAuthenticated) {
    return '/(auth)';
  }

  if (!hasAnyPet) {
    return '/(setup)/pet-type';
  }

  return '/(tabs)/home';
}

async function waitForMinSplashDuration(startedAt: number): Promise<void> {
  const remaining = SPLASH_MIN_DURATION_MS - (Date.now() - startedAt);
  if (remaining > 0) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, remaining);
    });
  }
}

export function useBootstrap() {
  const router = useRouter();
  const loadOnboardingStatus = useOnboardingStore((state) => state.loadOnboardingStatus);
  const loadPet = usePetStore((state) => state.loadPet);
  const initializeAuth = useUserStore((state) => state.initializeAuth);
  const clearOnboardingError = useOnboardingStore((state) => state.clearError);
  const clearPetError = usePetStore((state) => state.clearError);

  const [phase, setPhase] = useState<BootstrapPhase>('loading');
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  const runBootstrap = useCallback(async () => {
    const startedAt = Date.now();
    setPhase('loading');
    setError(null);
    clearOnboardingError();
    clearPetError();

    // Auth must resolve first so cloud pets are pulled into the local cache
    // before we load them into the pet store.
    await Promise.all([loadOnboardingStatus(), initializeAuth()]);
    await loadPet();

    const { pet } = usePetStore.getState();

    if (pet) {
      await syncCheckInReminderSchedule({ petName: pet.name });
      await syncPetReminderNotificationSchedule();
    }

    const onboardingError = useOnboardingStore.getState().error;
    const petError = usePetStore.getState().error;

    if (onboardingError || petError) {
      await waitForMinSplashDuration(startedAt);
      setError(onboardingError ?? petError);
      setPhase('error');
      return;
    }

    const { hasCompletedOnboarding } = useOnboardingStore.getState();

    if (hasCompletedOnboarding === null) {
      await waitForMinSplashDuration(startedAt);
      setError('Onboarding status is unavailable');
      setPhase('error');
      return;
    }

    const isAuthenticated = useUserStore.getState().authStatus === 'authenticated';
    const hasAnyPet = await petStorage.hasAnyPet();
    const notificationRoute = await getNotificationLaunchRoute();
    await waitForMinSplashDuration(startedAt);

    if (notificationRoute && isAuthenticated && hasAnyPet) {
      setPhase('redirecting');
      router.replace(notificationRoute);
      return;
    }

    setPhase('redirecting');
    router.replace(resolveBootstrapRoute(hasCompletedOnboarding, isAuthenticated, hasAnyPet));
  }, [
    clearOnboardingError,
    clearPetError,
    initializeAuth,
    loadOnboardingStatus,
    loadPet,
    router,
  ]);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    void runBootstrap();
  }, [runBootstrap]);

  return {
    phase,
    error,
    retry: runBootstrap,
  };
}
