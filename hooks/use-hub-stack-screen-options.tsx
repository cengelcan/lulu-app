import { HeaderBackButton } from 'expo-router/react-navigation';
import type { Href, NativeStackNavigationOptions } from 'expo-router';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * Header options for hub screens inside a nested stack (reports, records, reminders).
 * The default back button is hidden on the first screen of a nested stack, so we
 * render one that pops the parent navigator.
 */
export function useHubStackScreenOptions(
  title: string,
  fallbackRoute?: Href
): NativeStackNavigationOptions {
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');

  const headerLeft = useCallback(
    () => (
      <HeaderBackButton
        displayMode="minimal"
        tintColor={primaryColor}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }

          router.replace(fallbackRoute ?? '/(tabs)/care');
        }}
      />
    ),
    [fallbackRoute, primaryColor, router]
  );

  return useMemo(
    () => ({
      ...STACK_BACK_ONLY_OPTIONS,
      headerShown: true,
      title,
      headerBackVisible: false,
      headerLeft,
    }),
    [headerLeft, title]
  );
}
