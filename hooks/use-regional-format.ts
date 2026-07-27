import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { useLanguageStore } from '@/stores/language.store';
import { getDeviceRegionalSnapshot } from '@/utils/device-regional-settings';
import {
  resolveRegionalFormatContext,
  type DeviceRegionalSnapshot,
  type RegionalFormatContext,
} from '@/utils/regional-format';

export function useRegionalFormat(): RegionalFormatContext {
  const language = useLanguageStore((state) => state.resolvedLanguage);
  const [snapshot, setSnapshot] = useState<DeviceRegionalSnapshot>(getDeviceRegionalSnapshot);

  useEffect(() => {
    if (process.env.EXPO_OS !== 'android') {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        setSnapshot(getDeviceRegionalSnapshot());
      }
    });

    return () => subscription.remove();
  }, []);

  return useMemo(
    () => resolveRegionalFormatContext(language, snapshot),
    [language, snapshot]
  );
}
