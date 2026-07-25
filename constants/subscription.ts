/** RevenueCat entitlement identifier (App Store products map to this). */
export const REVENUECAT_ENTITLEMENT_PLUS = 'plus' as const;

/** App Store product identifiers — must match App Store Connect + RevenueCat. */
export const SUBSCRIPTION_PRODUCT_IDS = {
  monthly: 'lulu_plus_monthly',
  yearly: 'lulu_plus_yearly',
  lifetime: 'lulu_plus_lifetime',
} as const;

/** Products hidden from the current paywall but still recognized in existing receipts. */
export const LEGACY_SUBSCRIPTION_PRODUCT_IDS = {
  weekly: 'lulu_plus_weekly',
} as const;

export type SubscriptionProductId =
  (typeof SUBSCRIPTION_PRODUCT_IDS)[keyof typeof SUBSCRIPTION_PRODUCT_IDS];

/** Placeholder prices for dev preview / App Store review screenshots. */
export const SUBSCRIPTION_PREVIEW_PRICES: Record<SubscriptionProductId, string> = {
  [SUBSCRIPTION_PRODUCT_IDS.monthly]: '€4.99',
  [SUBSCRIPTION_PRODUCT_IDS.yearly]: '€24.99',
  [SUBSCRIPTION_PRODUCT_IDS.lifetime]: '€59.99',
};

/** Strikethrough anchor for yearly vs paying monthly for a full year (4.99 × 12). */
export const SUBSCRIPTION_YEARLY_COMPARE_PRICE = '€59.88';

/** Approximate savings vs monthly billing, for paywall badge copy. */
export const SUBSCRIPTION_YEARLY_SAVE_PERCENT = 58;

/** Free tier: active owned pets (deceased + shared pets excluded). */
export const FREE_ACTIVE_PET_LIMIT = 1;

/** Free tier: reminders created per calendar month (UTC on server). */
export const FREE_REMINDERS_PER_MONTH = 3;

/** Free tier: health records created per calendar month (UTC on server). */
export const FREE_RECORDS_PER_MONTH = 5;

/** Plus tier: safety cap on active owned pets. */
export const PLUS_ACTIVE_PET_CAP = 10;

/** Family size including owner (owner + up to 4 members). */
export const MAX_FAMILY_SIZE = 5;

/** Non-owner members allowed in a family group. */
export const MAX_FAMILY_NON_OWNER_MEMBERS = MAX_FAMILY_SIZE - 1;

export type PlusSource = 'revenuecat' | 'lifetime' | 'promo' | 'admin';

/** Gating keys used by usePlusFeature (step 4). */
export type PlusFeature =
  | 'multiplePets'
  | 'familySharing'
  | 'pdfExport'
  | 'medicationInventory'
  | 'vetVisitWorkspace'
  | 'unlimitedReminders'
  | 'unlimitedRecords';

/**
 * Dev-only bypass for Plus gating (family sharing, limits, paywall).
 * Also accepts the legacy family-sharing env var during transition.
 */
export const PLUS_DEV_BYPASS =
  process.env.EXPO_PUBLIC_PLUS_DEV_BYPASS === 'true' ||
  process.env.EXPO_PUBLIC_FAMILY_SHARING_DEV_BYPASS === 'true';
