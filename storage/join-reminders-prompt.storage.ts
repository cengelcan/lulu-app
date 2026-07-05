import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/constants/storage-keys';

export async function isJoinRemindersPromptPending(): Promise<boolean> {
  return (await AsyncStorage.getItem(StorageKeys.joinRemindersPromptPending)) === 'true';
}

export async function markJoinRemindersPromptPending(): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.joinRemindersPromptPending, 'true');
}

export async function clearJoinRemindersPromptPending(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.joinRemindersPromptPending);
}

export async function clearJoinRemindersPromptDismissed(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.joinRemindersPromptDismissed);
}

export async function clearJoinRemindersPromptState(): Promise<void> {
  await AsyncStorage.multiRemove([
    StorageKeys.joinRemindersPromptPending,
    StorageKeys.joinRemindersPromptDismissed,
  ]);
}

export async function isJoinRemindersPromptDismissed(): Promise<boolean> {
  return (await AsyncStorage.getItem(StorageKeys.joinRemindersPromptDismissed)) === 'true';
}

export async function dismissJoinRemindersPrompt(): Promise<void> {
  await AsyncStorage.multiSet([
    [StorageKeys.joinRemindersPromptDismissed, 'true'],
    [StorageKeys.joinRemindersPromptPending, 'false'],
  ]);
}
