import type { Href } from 'expo-router';

import { parseFamilyCodeFromUrl } from '@/utils/sharing/family-code';

export type FamilyJoinIntent = {
  code: string;
  route: Href;
  processingKey: string;
};

export function resolveFamilyJoinIntent(
  url: string,
  isAuthenticated: boolean
): FamilyJoinIntent | null {
  const code = parseFamilyCodeFromUrl(url);

  if (!code) {
    return null;
  }

  return {
    code,
    route: isAuthenticated
      ? (`/join-family?code=${code}` as Href)
      : (`/(auth)?joinCode=${code}` as Href),
    processingKey: `${isAuthenticated ? 'authenticated' : 'anonymous'}:${code}`,
  };
}
