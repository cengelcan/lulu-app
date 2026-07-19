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

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'string') {
          result.set(`${path}[${index}]`, item);
        }
      });
      continue;
    }

    if (value && typeof value === 'object') {
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
