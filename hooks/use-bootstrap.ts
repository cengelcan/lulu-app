import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getNotificationLaunchRoute, syncCheckInReminderSchedule } from '@/services/notifications';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { usePetStore } from '@/stores/pet.store';

export type BootstrapPhase = 'loading' | 'error' | 'redirecting';

function resolveBootstrapRoute(
  hasCompletedOnboarding: boolean,
  hasPet: boolean
): Href {
  if (!hasCompletedOnboarding) {
    return '/(onboarding)/intro-1';
  }

  if (!hasPet) {
    return '/(setup)/pet-type';
  }

  return '/(main)/dashboard';
}

export function useBootstrap() {
  const router = useRouter();
  const loadOnboardingStatus = useOnboardingStore((state) => state.loadOnboardingStatus);
  const loadPet = usePetStore((state) => state.loadPet);
  const clearOnboardingError = useOnboardingStore((state) => state.clearError);
  const clearPetError = usePetStore((state) => state.clearError);

  const [phase, setPhase] = useState<BootstrapPhase>('loading');
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  const runBootstrap = useCallback(async () => {
    setPhase('loading');
    setError(null);
    clearOnboardingError();
    clearPetError();

    await Promise.all([loadOnboardingStatus(), loadPet()]);

    if (usePetStore.getState().pet) {
      await syncCheckInReminderSchedule();
    }

    const onboardingError = useOnboardingStore.getState().error;
    const petError = usePetStore.getState().error;

    if (onboardingError || petError) {
      setError(onboardingError ?? petError);
      setPhase('error');
      return;
    }

    const { hasCompletedOnboarding } = useOnboardingStore.getState();
    const { pet } = usePetStore.getState();

    if (hasCompletedOnboarding === null) {
      setError('Onboarding status is unavailable');
      setPhase('error');
      return;
    }

    const notificationRoute = await getNotificationLaunchRoute();
    if (notificationRoute) {
      setPhase('redirecting');
      router.replace(notificationRoute);
      return;
    }

    setPhase('redirecting');
    router.replace(resolveBootstrapRoute(hasCompletedOnboarding, pet !== null));
  }, [
    clearOnboardingError,
    clearPetError,
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
