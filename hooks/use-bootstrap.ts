import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getNotificationLaunchRoute, syncCheckInReminderSchedule, syncMedicationDoseNotificationSchedule, syncPetReminderNotificationSchedule } from '@/services/notifications';
import { beginBootstrap, completeBootstrap } from '@/services/bootstrap/bootstrap-gate';
import { saveRemoteFamilyActivityDigestEnabled } from '@/services/notifications/family-activity-digest-preference';
import { registerFamilyActivityPushToken } from '@/services/notifications/push-registration';
import { getPendingFamilyJoinCode } from '@/storage/pending-family-join.storage';
import { loadExperiencePreferences } from '@/storage/experience-preferences.storage';
import * as petStorage from '@/storage/pet.storage';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useNotificationStore } from '@/stores/notification.store';
import { useLanguageStore } from '@/stores/language.store';
import { usePetStore } from '@/stores/pet.store';
import { useSetupStore } from '@/stores/setup.store';
import { useUserStore } from '@/stores/user.store';
import { hasJoinIntent } from '@/utils/join-intent';
import { resolveAuthenticatedNoPetRoute } from '@/utils/resolve-authenticated-no-pet-route';
import { getDeviceRegionalSnapshot } from '@/utils/device-regional-settings';
import { resolvePreAuthOnboardingRoute } from '@/utils/onboarding-route';

export type BootstrapPhase = 'loading' | 'error' | 'redirecting';

/** PRD Screen 01 — minimum splash visibility before navigation */
export const SPLASH_MIN_DURATION_MS = 1000;

async function resolveBootstrapRoute(
  hasCompletedOnboarding: boolean,
  isAuthenticated: boolean,
  hasAnyPet: boolean,
  joinIntent: boolean
): Promise<Href> {
  const preAuthRoute = resolvePreAuthOnboardingRoute(
    hasCompletedOnboarding,
    isAuthenticated,
    joinIntent
  );
  if (preAuthRoute) return preAuthRoute;

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

async function migrateExperiencePreferences(): Promise<void> {
  try {
    const regionalSnapshot = getDeviceRegionalSnapshot();
    await loadExperiencePreferences(regionalSnapshot.measurementSystem);
  } catch (preferenceMigrationError) {
    console.warn(
      '[preferences] Continuing with legacy preferences after migration failure',
      preferenceMigrationError
    );
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
    await migrateExperiencePreferences();

    // Auth must resolve first so cloud pets are pulled into the local cache
    // before we load them into the pet store.
    await Promise.all([loadOnboardingStatus(), initializeAuth()]);
    await loadPet();

    if (useUserStore.getState().authStatus === 'authenticated') {
      await useNotificationStore.getState().loadNotificationSettings();
      if (useNotificationStore.getState().familyActivityDigestEnabled) {
        try {
          const userId = useUserStore.getState().userId;
          const language = useLanguageStore.getState().resolvedLanguage;
          await Promise.all([
            registerFamilyActivityPushToken(),
            userId
              ? saveRemoteFamilyActivityDigestEnabled(userId, true, language)
              : Promise.resolve(),
          ]);
        } catch (registrationError) {
          console.warn('Failed to refresh family activity push token', registrationError);
        }
      }
    }

    const { pet } = usePetStore.getState();

    if (pet) {
      await syncCheckInReminderSchedule({ petName: pet.name });
      await syncPetReminderNotificationSchedule();
      await syncMedicationDoseNotificationSchedule();
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
