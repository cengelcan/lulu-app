import type { Href } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { setPendingFamilyJoinCode } from '@/storage/pending-family-join.storage';
import { setOnboardingCompleted } from '@/storage/prefs.storage';
import { setUserSetupPath } from '@/storage/setup-path.storage';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useUserStore } from '@/stores/user.store';
import { resolveFamilyJoinIntent } from '@/utils/sharing/family-join-intent';

async function handleJoinUrl(
  code: string,
  route: Href,
  navigate: (href: Href) => void
): Promise<void> {
  await setPendingFamilyJoinCode(code);
  await setUserSetupPath('join_family');
  await setOnboardingCompleted(true);
  useOnboardingStore.setState({ hasCompletedOnboarding: true });

  navigate(route);
}

export function useJoinDeepLink(): void {
  const router = useRouter();
  const linkingUrl = ExpoLinking.useLinkingURL();
  const authStatus = useUserStore((state) => state.authStatus);
  const isAuthenticated = authStatus === 'authenticated';
  const processedIntents = useRef(new Set<string>());

  const processUrl = useCallback(
    async (url: string) => {
      const intent = resolveFamilyJoinIntent(url, isAuthenticated);

      if (!intent || processedIntents.current.has(intent.processingKey)) {
        return;
      }

      processedIntents.current.add(intent.processingKey);

      try {
        await handleJoinUrl(intent.code, intent.route, router.push);
      } catch (error) {
        processedIntents.current.delete(intent.processingKey);
        console.warn('[family] Failed to process join deep link', error);
      }
    },
    [isAuthenticated, router]
  );

  useEffect(() => {
    if (linkingUrl) {
      void processUrl(linkingUrl);
    }
  }, [linkingUrl, processUrl]);

  useEffect(() => {
    void ExpoLinking.getInitialURL().then((url) => {
      if (url) {
        void processUrl(url);
      }
    });

    const subscription = ExpoLinking.addEventListener('url', ({ url }) => {
      void processUrl(url);
    });

    return () => subscription.remove();
  }, [processUrl]);
}
