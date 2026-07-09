import type { NativeStackNavigationOptions } from 'expo-router';

import { Spacing } from '@/constants/theme';

/** iOS: chevron-only back button without previous screen title. */
export const STACK_BACK_ONLY_OPTIONS = {
  headerBackButtonDisplayMode: 'minimal',
} as const satisfies NativeStackNavigationOptions;

/** Keeps header action buttons from stretching across the right header slot. */
export const HEADER_ACTION_CONTAINER_STYLE = {
  paddingRight: Spacing.md,
  justifyContent: 'center',
  alignItems: 'flex-end',
  minWidth: 0,
  flexGrow: 0,
  flexShrink: 1,
} as const;
