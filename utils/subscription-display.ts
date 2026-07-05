import type { PlusPlanKind } from '@/services/subscription/plus-status';

/** RevenueCat iOS bridge may send enum names, lowercase strings, or numeric values. */
export function isIntroOrTrialPeriod(
  periodType: unknown,
  planKind: PlusPlanKind,
  purchasedAt: string | null,
  expiresAt: string | null
): boolean {
  if (planKind === 'lifetime') {
    return false;
  }

  const normalized = String(periodType ?? '').toUpperCase();
  if (normalized === 'TRIAL' || normalized === 'INTRO') {
    return true;
  }

  // RC iOS native enum: NORMAL = 0, INTRO = 1, TRIAL = 2
  if (periodType === 1 || periodType === 2) {
    return true;
  }

  return isLikelyIntroductoryBillingPeriod(planKind, purchasedAt, expiresAt);
}

function isLikelyIntroductoryBillingPeriod(
  planKind: PlusPlanKind,
  purchasedAt: string | null,
  expiresAt: string | null
): boolean {
  if (!purchasedAt || !expiresAt) {
    return false;
  }

  const periodMs = new Date(expiresAt).getTime() - new Date(purchasedAt).getTime();
  if (periodMs <= 0) {
    return false;
  }

  const periodDays = periodMs / (1000 * 60 * 60 * 24);
  const fullCycleDays = planKind === 'weekly' ? 7 : planKind === 'yearly' ? 365 : 0;

  if (fullCycleDays === 0) {
    return false;
  }

  // Current billing period is shorter than a full cycle → free trial / intro offer.
  return periodDays < fullCycleDays * 0.9;
}

export function formatSubscriptionDate(isoDate: string, locale: string): string | null {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getTrialDaysRemaining(expiresAt: string): number {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** After trial ends, when the next paid renewal is expected (yearly → +1 year, weekly → +1 week). */
export function projectNextRenewalDate(
  currentPeriodEndsAt: string,
  planKind: PlusPlanKind
): Date | null {
  const periodEnd = new Date(currentPeriodEndsAt);
  if (Number.isNaN(periodEnd.getTime())) {
    return null;
  }

  const nextRenewal = new Date(periodEnd);

  switch (planKind) {
    case 'weekly':
      nextRenewal.setDate(nextRenewal.getDate() + 7);
      return nextRenewal;
    case 'yearly':
      nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
      return nextRenewal;
    default:
      return null;
  }
}

export function getPlanLabelKey(planKind: PlusPlanKind): string | null {
  switch (planKind) {
    case 'weekly':
      return 'profile.luluPlusPlanWeekly';
    case 'yearly':
      return 'profile.luluPlusPlanYearly';
    case 'lifetime':
      return 'profile.luluPlusPlanLifetime';
    default:
      return null;
  }
}
