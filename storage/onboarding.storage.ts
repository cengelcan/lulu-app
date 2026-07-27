import {
  loadExperiencePreferences,
  saveOnboardingVersionCompleted,
} from '@/storage/experience-preferences.storage';
import { getOnboardingCompleted, setOnboardingCompleted } from '@/storage/prefs.storage';
import { CURRENT_ONBOARDING_VERSION } from '@/types/experience-preferences';
import { getDeviceRegionalSnapshot } from '@/utils/device-regional-settings';

export async function getCurrentOnboardingCompleted(): Promise<boolean> {
  const [legacyCompleted, preferences] = await Promise.all([
    getOnboardingCompleted(),
    loadExperiencePreferences(getDeviceRegionalSnapshot().measurementSystem),
  ]);

  return (
    legacyCompleted ||
    preferences.onboardingVersionCompleted >= CURRENT_ONBOARDING_VERSION
  );
}

export async function completeCurrentOnboarding(): Promise<void> {
  await Promise.all([
    setOnboardingCompleted(true),
    saveOnboardingVersionCompleted(CURRENT_ONBOARDING_VERSION),
  ]);
}

export async function resetCurrentOnboarding(): Promise<void> {
  await Promise.all([
    setOnboardingCompleted(false),
    saveOnboardingVersionCompleted(0),
  ]);
}
