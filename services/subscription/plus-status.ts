export type PlusStatus = {
  isPlusActive: boolean;
  plusExpiresAt: string | null;
};

export function resolvePlusStatus(input: {
  plusActive: boolean;
  plusExpiresAt: string | null;
}): PlusStatus {
  const { plusExpiresAt } = input;
  const isPlusActive =
    input.plusActive &&
    (plusExpiresAt === null || new Date(plusExpiresAt).getTime() > Date.now());

  return { isPlusActive, plusExpiresAt };
}

/** Prefer the active subscription when merging client (RevenueCat) and server (Supabase). */
export function mergePlusStatus(primary: PlusStatus, secondary: PlusStatus): PlusStatus {
  if (primary.isPlusActive) {
    return primary;
  }

  if (secondary.isPlusActive) {
    return secondary;
  }

  return { isPlusActive: false, plusExpiresAt: null };
}
