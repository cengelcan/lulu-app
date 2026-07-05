export const CHECK_IN_REMINDER_VARIANT_COUNT = 5;

export function formatCheckInReminderDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Stable per day + pet so the same notification does not reshuffle on every sync. */
export function pickCheckInReminderVariantIndex(
  dateKey: string,
  petId: string,
  variantCount = CHECK_IN_REMINDER_VARIANT_COUNT
): number {
  const seed = `${dateKey}:${petId}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash % variantCount;
}
