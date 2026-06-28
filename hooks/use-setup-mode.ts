import { type Href } from 'expo-router';

import { useSetupStore } from '@/stores/setup.store';
import type { SetupMode } from '@/types/setup';

export type { SetupMode } from '@/types/setup';

type SetupRoutePath =
  | '/(setup)/pet-name-breed'
  | '/(setup)/pet-age-health'
  | '/(setup)/pet-photo'
  | '/(setup)/check-in-prefs';

const ADD_MODE_PARAM = 'add';

export function useSetupMode(): SetupMode {
  return useSetupStore((state) => state.setupMode);
}

export function parseSetupModeParam(mode?: string | string[]): SetupMode {
  const value = Array.isArray(mode) ? mode[0] : mode;
  return value === ADD_MODE_PARAM ? 'add' : 'initial';
}

export function setupRoute(path: SetupRoutePath, mode: SetupMode): Href {
  if (mode === 'add') {
    return `${path}?mode=${ADD_MODE_PARAM}` as Href;
  }

  return path as Href;
}

export function setupTotalSteps(mode: SetupMode): number {
  return mode === 'add' ? 4 : 6;
}
