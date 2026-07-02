/** Resolves a store error to a translation key (never a raw English sentence). */
export function getStoreErrorKey(error: unknown, fallbackKey: string): string {
  if (error instanceof Error && error.message.startsWith('errors.')) {
    return error.message;
  }

  return fallbackKey;
}
