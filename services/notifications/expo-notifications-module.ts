import { Platform } from 'react-native';

import { isExpoGo } from '@/utils/is-expo-go';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExpoNotificationsModule = any;

let cachedModule: ExpoNotificationsModule | null | undefined;

export async function getExpoNotificationsModule(): Promise<ExpoNotificationsModule | null> {
  if (Platform.OS === 'web' || isExpoGo()) {
    return null;
  }

  if (cachedModule === undefined) {
    cachedModule = await import('expo-notifications');
  }

  return cachedModule;
}
