import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useAppearanceStore } from '@/stores/appearance.store';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme(): 'light' | 'dark' | null {
  const [hasHydrated, setHasHydrated] = useState(false);
  const appearance = useAppearanceStore((state) => state.appearance);
  const systemScheme = useRNColorScheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return 'light';
  }

  if (appearance === 'light') {
    return 'light';
  }

  if (appearance === 'dark') {
    return 'dark';
  }

  return systemScheme ?? null;
}
