import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/constants/storage-keys';
import type { UserSetupPath } from '@/types/setup-path';

function isUserSetupPath(value: string | null): value is UserSetupPath {
  return value === 'owner' || value === 'join_family';
}

export async function getUserSetupPath(): Promise<UserSetupPath | null> {
  const value = await AsyncStorage.getItem(StorageKeys.userSetupPath);
  return isUserSetupPath(value) ? value : null;
}

export async function setUserSetupPath(path: UserSetupPath): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.userSetupPath, path);
}

export async function clearUserSetupPath(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.userSetupPath);
}
