import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/** iOS: chevron-only back button without previous screen title. */
export const STACK_BACK_ONLY_OPTIONS = {
  headerBackButtonDisplayMode: 'minimal',
} as const satisfies NativeStackNavigationOptions;
