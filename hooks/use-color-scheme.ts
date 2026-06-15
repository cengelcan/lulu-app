import { useColorScheme as useRNColorScheme } from 'react-native';

import { useAppearanceStore } from '@/stores/appearance.store';

export function useColorScheme(): 'light' | 'dark' | null {
  const appearance = useAppearanceStore((state) => state.appearance);
  const systemScheme = useRNColorScheme();

  if (appearance === 'light') {
    return 'light';
  }

  if (appearance === 'dark') {
    return 'dark';
  }

  return systemScheme;
}
