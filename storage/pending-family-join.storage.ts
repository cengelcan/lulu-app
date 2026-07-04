import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/constants/storage-keys';

export async function getPendingFamilyJoinCode(): Promise<string | null> {
  return AsyncStorage.getItem(StorageKeys.pendingFamilyJoinCode);
}

export async function setPendingFamilyJoinCode(code: string): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.pendingFamilyJoinCode, code);
}

export async function clearPendingFamilyJoinCode(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.pendingFamilyJoinCode);
}
