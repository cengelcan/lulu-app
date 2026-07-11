import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getNotificationLaunchRoute, syncCheckInReminderSchedule, syncPetReminderNotificationSchedule } from '@/services/notifications';
import { beginBootstrap, completeBootstrap } from '@/services/bootstrap/bootstrap-gate';
import { getPendingFamilyJoinCode } from '@/storage/pending-family-join.storage';
import * as petStorage from '@/storage/pet.storage';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { usePetStore } from '@/stores/pet.store';
import { useSetupStore } from '@/stores/setup.store';
import { useUserStore } from '@/stores/user.store';
import { hasJoinIntent } from '@/utils/join-intent';
import { resolveAuthenticatedNoPetRoute } from '@/utils/resolve-authenticated-no-pet-route';

export type BootstrapPhase = 'loading' | 'error' | 'redirecting';

/** PRD Screen 01 — minimum splash visibility before navigation */
export const SPLASH_MIN_DURATION_MS = 1000;

async function resolveBootstrapRoute(
  hasCompletedOnboarding: boolean,
  isAuthenticated: boolean,
  hasAnyPet: boolean,
  joinIntent: boolean
): Promise<Href> {
  if (!hasCompletedOnboarding && !joinIntent) {
    return '/welcome';
  }

  if (!hasCompletedOnboarding && joinIntent && !isAuthenticated) {
    return '/(auth)?mode=signUp';
  }

  if (!isAuthenticated) {
    return '/(auth)';
  }

  if (!hasAnyPet) {
    return resolveAuthenticatedNoPetRoute();
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
    beginBootstrap();
    const startedAt = Date.now();
    setPhase('loading');
    setError(null);
    clearOnboardingError();
    clearPetError();

    try {
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
      setError('errors.onboardingUnavailable');
      setPhase('error');
      return;
    }

    const isAuthenticated = useUserStore.getState().authStatus === 'authenticated';
    const hasAnyPet = await petStorage.hasAnyPet();
    const joinIntent = await hasJoinIntent();
    const notificationRoute =
      isAuthenticated && hasAnyPet ? await getNotificationLaunchRoute() : null;
    await waitForMinSplashDuration(startedAt);

    const pendingJoinCode = isAuthenticated ? await getPendingFamilyJoinCode() : null;

    if (notificationRoute && isAuthenticated && hasAnyPet && !pendingJoinCode) {
      setPhase('redirecting');
      router.replace(notificationRoute);
      return;
    }

    setPhase('redirecting');

    const route = await resolveBootstrapRoute(
      hasCompletedOnboarding,
      isAuthenticated,
      hasAnyPet,
      joinIntent
    );

    if (route === '/(setup)/pet-type') {
      useSetupStore.getState().beginSetup('initial');
    }

    router.replace(route);
    } finally {
      completeBootstrap();
    }
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
