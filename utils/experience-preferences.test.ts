import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createDefaultExperiencePreferences,
  migrateLegacyExperiencePreferences,
  normalizeExperiencePreferences,
} from '@/utils/experience-preferences';
import { normalizeContextualEducationDismissedState } from '@/utils/contextual-education';
import { resolvePreAuthOnboardingRoute } from '@/utils/onboarding-route';

describe('experience preference defaults', () => {
  it('uses pounds only for the US measurement system', () => {
    assert.equal(createDefaultExperiencePreferences('us').weightUnitPreference, 'lb');
    assert.equal(createDefaultExperiencePreferences('metric').weightUnitPreference, 'kg');
    assert.equal(createDefaultExperiencePreferences('uk').weightUnitPreference, 'kg');
    assert.equal(createDefaultExperiencePreferences(null).weightUnitPreference, 'kg');
  });

  it('preserves current notification behavior for new schema defaults', () => {
    const preferences = createDefaultExperiencePreferences('metric');

    assert.deepEqual(preferences.notifications, {
      dailyCheckIn: false,
      petReminders: true,
      medicationDoses: true,
      medicationRefill: true,
      familyDigest: false,
    });
  });
});

describe('legacy experience preference migration', () => {
  it('keeps existing users out of the new onboarding and preserves toggles', () => {
    const preferences = migrateLegacyExperiencePreferences(
      {
        onboardingCompleted: true,
        appAppearance: 'dark',
        notificationPermission: 'allowed',
        petReminderNotificationsEnabled: false,
        familyActivityDigestEnabled: true,
      },
      'metric'
    );

    assert.equal(preferences.onboardingVersionCompleted, 1);
    assert.equal(preferences.themePreference, 'dark');
    assert.equal(preferences.notifications.dailyCheckIn, true);
    assert.equal(preferences.notifications.petReminders, false);
    assert.equal(preferences.notifications.medicationDoses, true);
    assert.equal(preferences.notifications.familyDigest, true);
  });

  it('falls back safely when legacy values are missing or invalid', () => {
    const preferences = migrateLegacyExperiencePreferences(
      { appAppearance: 'sepia', notificationPermission: 'denied' },
      'us'
    );

    assert.equal(preferences.themePreference, 'system');
    assert.equal(preferences.weightUnitPreference, 'lb');
    assert.equal(preferences.notifications.dailyCheckIn, false);
  });
});

describe('experience preference normalization', () => {
  it('repairs partial or future-shaped stored values without losing valid choices', () => {
    const preferences = normalizeExperiencePreferences(
      {
        schemaVersion: 99,
        themePreference: 'light',
        weightUnitPreference: 'stone',
        onboardingVersionCompleted: 2,
        notifications: { petReminders: false },
      },
      'metric'
    );

    assert.ok(preferences);
    assert.equal(preferences.themePreference, 'light');
    assert.equal(preferences.weightUnitPreference, 'kg');
    assert.equal(preferences.onboardingVersionCompleted, 2);
    assert.equal(preferences.notifications.petReminders, false);
    assert.equal(preferences.notifications.medicationDoses, true);
  });

  it('rejects non-object storage payloads', () => {
    assert.equal(normalizeExperiencePreferences(null, 'metric'), null);
    assert.equal(normalizeExperiencePreferences('bad', 'metric'), null);
  });
});

describe('v1.4 onboarding route', () => {
  it('shows the single welcome screen only to new users without an invite', () => {
    assert.equal(resolvePreAuthOnboardingRoute(false, false, false), '/welcome');
    assert.equal(resolvePreAuthOnboardingRoute(true, false, false), '/(auth)');
  });

  it('lets family invites bypass welcome without creating a redirect loop', () => {
    assert.equal(resolvePreAuthOnboardingRoute(false, false, true), '/(auth)?mode=signUp');
    assert.equal(resolvePreAuthOnboardingRoute(false, true, true), null);
  });
});

describe('contextual education preference', () => {
  it('keeps only known dismissed topics and recovers from invalid values', () => {
    assert.deepEqual(
      normalizeContextualEducationDismissedState({
        medication: true,
        family: false,
        vet_visit: true,
        unknown: true,
      }),
      { medication: true, vet_visit: true }
    );
    assert.deepEqual(normalizeContextualEducationDismissedState(null), {});
    assert.deepEqual(normalizeContextualEducationDismissedState([]), {});
  });
});
