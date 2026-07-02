export function flattenTranslations(
  obj: Record<string, unknown>,
  prefix = ''
): Map<string, string> {
  const result = new Map<string, string>();

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      result.set(path, value);
      continue;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [nestedKey, nestedValue] of flattenTranslations(
        value as Record<string, unknown>,
        path
      )) {
        result.set(nestedKey, nestedValue);
      }
    }
  }

  return result;
}
