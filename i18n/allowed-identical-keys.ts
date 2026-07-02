/**
 * Keys and prefixes where German values may legitimately match English.
 *
 * See i18n/ALLOWED_IDENTICAL_KEYS.md for rationale (brand terms, units, breed names, etc.).
 */

/** Full dot-path keys that may have identical EN/DE string values. */
export const ALLOWED_IDENTICAL_KEYS = new Set<string>([
  // L4 — product terminology
  'checkIn.title',

  // L5 — brand / product names
  'welcome.appName',
  'welcome.tagline',
  'notifications.reminderTitle',
  'profile.luluPlus',
  'paywall.title',
  'paywall.plusColumn',
  'paywall.freePetLimit',
  'paywall.notIncluded',
  'profile.version',
  'profile.luluPlusActiveStatus',
  'profile.manageA11y',
  'profile.upgradeA11y',

  // Language picker labels (shown in the target language)
  'settings.languageEnglish',
  'settings.languageGerman',
  'settings.languageSystem',

  // Units and symbols
  'common.ok',
  'common.optional',
  'records.units.kg',
  'records.units.lb',

  // Placeholder-only templates (locale-neutral)
  'dashboard.lastCheckInWhenDate',
  'checkIn.progressCard.percentComplete',
  'records.summary.weightValue',
  'reports.petCard.weightRecorded',
  'reports.review.generatedOn',

  // Identical in German (loanwords / shared vocabulary)
  'records.sections.details',
  'reminders.sections.details',
  'records.fields.symptomName',
  'records.grid.symptom',
  'records.types.symptom',
  'setup.petNameBreed.nameLabel',

  // Brand
  'reports.appStoreBadgeLine2',

  // Medical terms (latin/international)
  'pet.options.healthCondition.diabetes',
  'pet.options.healthCondition.arthritis',

  // Email is commonly left untranslated
  'auth.emailLabel',
  'auth.emailPlaceholder',
]);

/**
 * Key prefixes where leaf values may match English (e.g. latin breed names).
 * A key matches if it equals the prefix or starts with `prefix.`.
 */
export const ALLOWED_IDENTICAL_PREFIXES = [
  'pet.options.breeds.',
  'checkIn.options.',
  'checkIn.status.',
] as const;

export function isAllowedIdenticalKey(key: string): boolean {
  if (ALLOWED_IDENTICAL_KEYS.has(key)) {
    return true;
  }

  return ALLOWED_IDENTICAL_PREFIXES.some(
    (prefix) => key === prefix.slice(0, -1) || key.startsWith(prefix)
  );
}
