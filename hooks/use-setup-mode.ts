import { type Href, useLocalSearchParams } from 'expo-router';

export type SetupMode = 'initial' | 'add';

type SetupRoutePath =
  | '/(setup)/pet-name'
  | '/(setup)/pet-age'
  | '/(setup)/health-conditions'
  | '/(setup)/check-in-prefs';

const ADD_MODE_PARAM = 'add';

export function useSetupMode(): SetupMode {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  return mode === ADD_MODE_PARAM ? 'add' : 'initial';
}

export function setupRoute(path: SetupRoutePath, mode: SetupMode): Href {
  if (mode === 'add') {
    return `${path}?mode=${ADD_MODE_PARAM}` as Href;
  }

  return path;
}

export function setupTotalSteps(mode: SetupMode): number {
  return mode === 'add' ? 4 : 6;
}
