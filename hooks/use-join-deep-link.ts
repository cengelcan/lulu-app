import type { Href } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { setPendingFamilyJoinCode } from '@/storage/pending-family-join.storage';
import { setOnboardingCompleted } from '@/storage/prefs.storage';
import { setUserSetupPath } from '@/storage/setup-path.storage';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useUserStore } from '@/stores/user.store';
import { parseFamilyCodeFromUrl } from '@/utils/sharing/family-code';

async function handleJoinUrl(
  url: string,
  isAuthenticated: boolean,
  navigate: (href: Href) => void
): Promise<void> {
  const code = parseFamilyCodeFromUrl(url);

  if (!code) {
    return;
  }

  await setPendingFamilyJoinCode(code);
  await setUserSetupPath('join_family');
  await setOnboardingCompleted(true);
  useOnboardingStore.setState({ hasCompletedOnboarding: true });

  if (isAuthenticated) {
    navigate(`/join-family?code=${code}` as Href);
    return;
  }

  navigate(`/(auth)?joinCode=${code}` as Href);
}

export function useJoinDeepLink(): void {
  const router = useRouter();
  const linkingUrl = ExpoLinking.useLinkingURL();
  const authStatus = useUserStore((state) => state.authStatus);
  const isAuthenticated = authStatus === 'authenticated';

  useEffect(() => {
    if (linkingUrl) {
      void handleJoinUrl(linkingUrl, isAuthenticated, router.push);
    }
  }, [isAuthenticated, linkingUrl, router]);

  useEffect(() => {
    void ExpoLinking.getInitialURL().then((url) => {
      if (url) {
        void handleJoinUrl(url, isAuthenticated, router.push);
      }
    });

    const subscription = ExpoLinking.addEventListener('url', ({ url }) => {
      void handleJoinUrl(url, isAuthenticated, router.push);
    });

    return () => subscription.remove();
  }, [isAuthenticated, router]);
}
