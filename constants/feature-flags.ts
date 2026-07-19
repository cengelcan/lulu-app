export function resolveEnabledFlag(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  return value.trim().toLowerCase() !== 'false';
}

export const FeatureFlags = {
  homeHealthOverview: resolveEnabledFlag(
    process.env.EXPO_PUBLIC_HOME_HEALTH_OVERVIEW_ENABLED,
    true
  ),
} as const;
