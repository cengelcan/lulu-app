import type { Href } from 'expo-router';

export function resolvePreAuthOnboardingRoute(
  hasCompletedOnboarding: boolean,
  isAuthenticated: boolean,
  hasJoinIntent: boolean
): Href | null {
  if (!hasCompletedOnboarding && !hasJoinIntent) return '/welcome';
  if (!hasCompletedOnboarding && hasJoinIntent && !isAuthenticated) {
    return '/(auth)?mode=signUp';
  }
  if (!isAuthenticated) return '/(auth)';
  return null;
}
