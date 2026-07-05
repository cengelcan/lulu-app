export type PlusPlanKind = 'weekly' | 'yearly' | 'lifetime' | 'unknown';

export type PlusSubscriptionDetails = {
  planKind: PlusPlanKind;
  productId: string | null;
  isTrialPeriod: boolean;
  willRenew: boolean;
  expiresAt: string | null;
  purchasedAt: string | null;
};

export type PlusStatus = {
  isPlusActive: boolean;
  plusExpiresAt: string | null;
  subscription: PlusSubscriptionDetails | null;
};

export function resolvePlusStatus(input: {
  plusActive: boolean;
  plusExpiresAt: string | null;
  subscription?: PlusSubscriptionDetails | null;
}): PlusStatus {
  const { plusExpiresAt } = input;
  const isPlusActive =
    input.plusActive &&
    (plusExpiresAt === null || new Date(plusExpiresAt).getTime() > Date.now());

  return {
    isPlusActive,
    plusExpiresAt,
    subscription: input.subscription ?? null,
  };
}

/** Prefer the active subscription when merging client (RevenueCat) and server (Supabase). */
export function mergePlusStatus(primary: PlusStatus, secondary: PlusStatus): PlusStatus {
  if (primary.isPlusActive) {
    return primary;
  }

  if (secondary.isPlusActive) {
    return secondary;
  }

  return { isPlusActive: false, plusExpiresAt: null, subscription: null };
}
