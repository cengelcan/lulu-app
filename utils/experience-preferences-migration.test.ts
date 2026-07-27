import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type {
  ExperiencePreferences,
  LegacyExperiencePreferenceSnapshot,
} from '@/types/experience-preferences';
import { loadOrMigrateExperiencePreferences } from '@/utils/experience-preferences-migration';

describe('v1.3 to v1.4 experience preference migration', () => {
  it('copies legacy choices into v1.4 without mutating the v1.3 snapshot', async () => {
    const legacy: LegacyExperiencePreferenceSnapshot = {
      onboardingCompleted: true,
      appAppearance: 'dark',
      notificationPermission: 'allowed',
      petReminderNotificationsEnabled: false,
      familyActivityDigestEnabled: true,
    };
    const beforeMigration = structuredClone(legacy);
    let stored: ExperiencePreferences | null = null;

    const preferences = await loadOrMigrateExperiencePreferences(
      {
        readCurrent: () => null,
        readLegacy: async () => legacy,
        writeCurrent: (value) => {
          stored = value;
        },
      },
      'metric'
    );

    assert.deepEqual(legacy, beforeMigration);
    assert.deepEqual(stored, preferences);
    assert.equal(preferences.themePreference, 'dark');
    assert.equal(preferences.onboardingVersionCompleted, 1);
    assert.equal(preferences.notifications.dailyCheckIn, true);
    assert.equal(preferences.notifications.petReminders, false);
    assert.equal(preferences.notifications.familyDigest, true);
  });

  it('normalizes an existing v1.4 payload without consulting legacy storage', async () => {
    let legacyReads = 0;
    let stored: ExperiencePreferences | null = null;

    const preferences = await loadOrMigrateExperiencePreferences(
      {
        readCurrent: () => ({
          schemaVersion: 1,
          themePreference: 'light',
          weightUnitPreference: 'lb',
          onboardingVersionCompleted: 1,
          notifications: {
            dailyCheckIn: false,
            petReminders: false,
            medicationDoses: false,
            medicationRefill: true,
            familyDigest: false,
          },
        }),
        readLegacy: async () => {
          legacyReads += 1;
          return {};
        },
        writeCurrent: (value) => {
          stored = value;
        },
      },
      'us'
    );

    assert.equal(legacyReads, 0);
    assert.deepEqual(stored, preferences);
    assert.equal(preferences.themePreference, 'light');
    assert.equal(preferences.weightUnitPreference, 'lb');
    assert.equal(preferences.notifications.medicationDoses, false);
  });
});
