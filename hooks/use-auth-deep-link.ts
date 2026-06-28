import * as ExpoLinking from 'expo-linking';
import { useEffect } from 'react';

import { ensureRecoverySession, hasAuthParamsInUrl } from '@/services/auth';

async function handleAuthUrl(url: string): Promise<void> {
  if (!hasAuthParamsInUrl(url)) {
    return;
  }

  try {
    await ensureRecoverySession(url);
  } catch (error) {
    console.warn('[auth] Failed to establish session from deep link', error);
  }
}

/**
 * Captures Supabase auth tokens from deep links as early as possible, before
 * expo-router can route without the URL hash.
 */
export function useAuthDeepLink(): void {
  const linkingUrl = ExpoLinking.useLinkingURL();

  useEffect(() => {
    if (linkingUrl && hasAuthParamsInUrl(linkingUrl)) {
      void handleAuthUrl(linkingUrl);
    }
  }, [linkingUrl]);

  useEffect(() => {
    void ExpoLinking.getInitialURL().then((url) => {
      if (url) {
        void handleAuthUrl(url);
      }
    });

    const subscription = ExpoLinking.addEventListener('url', ({ url }) => {
      void handleAuthUrl(url);
    });

    return () => subscription.remove();
  }, []);
}
