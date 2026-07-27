import type {
  DeviceMeasurementSystem,
  ExperiencePreferences,
  LegacyExperiencePreferenceSnapshot,
} from '@/types/experience-preferences';
import {
  migrateLegacyExperiencePreferences,
  normalizeExperiencePreferences,
} from '@/utils/experience-preferences';

export type ExperiencePreferenceMigrationStorage = {
  readCurrent: () => unknown;
  readLegacy: () => Promise<LegacyExperiencePreferenceSnapshot>;
  writeCurrent: (preferences: ExperiencePreferences) => void;
};

/**
 * Resolves v1.4 preferences without deleting or rewriting any v1.3 keys.
 * Keeping storage access injectable makes the release upgrade contract testable
 * without loading native AsyncStorage or SQLite modules in Node.
 */
export async function loadOrMigrateExperiencePreferences(
  storage: ExperiencePreferenceMigrationStorage,
  measurementSystem: DeviceMeasurementSystem
): Promise<ExperiencePreferences> {
  const current = normalizeExperiencePreferences(storage.readCurrent(), measurementSystem);
  if (current) {
    storage.writeCurrent(current);
    return current;
  }

  const preferences = migrateLegacyExperiencePreferences(
    await storage.readLegacy(),
    measurementSystem
  );
  storage.writeCurrent(preferences);
  return preferences;
}
