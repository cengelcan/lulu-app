import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { fetchIosAppReleasePolicy } from '@/services/app-update/release-policy';
import {
  getAppUpdateDismissal,
  saveAppUpdateDismissal,
} from '@/storage/app-update.storage';
import {
  type AppUpdateDecision,
  resolveAppUpdateDecision,
  shouldShowOptionalUpdate,
} from '@/utils/app-version';

function getDevelopmentPreview(): AppUpdateDecision | null {
  if (!__DEV__) {
    return null;
  }

  const previewKind = process.env.EXPO_PUBLIC_APP_UPDATE_PREVIEW;
  if (previewKind !== 'optional' && previewKind !== 'required') {
    return null;
  }

  return {
    kind: previewKind,
    currentVersion: Application.nativeApplicationVersion ?? '1.3.0',
    latestVersion: '1.4.0',
    storeUrl: 'https://apps.apple.com/app/id6787669539',
    reminderIntervalHours: 24,
  };
}

async function resolveAvailableUpdate(): Promise<AppUpdateDecision | null> {
  const preview = getDevelopmentPreview();
  if (preview) {
    return preview;
  }

  if (Platform.OS !== 'ios') {
    return null;
  }

  const releaseType = await Application.getIosApplicationReleaseTypeAsync();
  if (releaseType !== Application.ApplicationReleaseType.APP_STORE) {
    return null;
  }

  const currentVersion = Application.nativeApplicationVersion;
  if (!currentVersion) {
    return null;
  }

  const policy = await fetchIosAppReleasePolicy();
  if (!policy) {
    return null;
  }

  const decision = resolveAppUpdateDecision(currentVersion, policy);
  if (!decision || decision.kind === 'required') {
    return decision;
  }

  const dismissal = await getAppUpdateDismissal();
  return shouldShowOptionalUpdate(
    decision.latestVersion,
    dismissal,
    decision.reminderIntervalHours
  )
    ? decision
    : null;
}

export function useAppUpdate() {
  const [decision, setDecision] = useState<AppUpdateDecision | null>(null);
  const [isOpeningStore, setIsOpeningStore] = useState(false);
  const [openStoreFailed, setOpenStoreFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void resolveAvailableUpdate()
      .then((update) => {
        if (!cancelled) {
          setDecision(update);
        }
      })
      .catch((error) => {
        if (__DEV__) {
          console.warn('[app update] Update check failed open', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    if (!decision || decision.kind !== 'optional') {
      return;
    }

    void saveAppUpdateDismissal({
      version: decision.latestVersion,
      dismissedAt: Date.now(),
    }).catch(() => {});
    setDecision(null);
  }, [decision]);

  const openStore = useCallback(async () => {
    if (!decision || isOpeningStore) {
      return;
    }

    setIsOpeningStore(true);
    setOpenStoreFailed(false);
    try {
      await Linking.openURL(decision.storeUrl);
    } catch {
      setOpenStoreFailed(true);
    } finally {
      setIsOpeningStore(false);
    }
  }, [decision, isOpeningStore]);

  return {
    decision,
    dismiss,
    openStore,
    isOpeningStore,
    openStoreFailed,
  };
}
