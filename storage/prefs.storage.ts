import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/constants/storage-keys';
import type { CheckInPreference } from '@/types/check-in';

export type NotificationPermissionStatus = 'allowed' | 'later' | 'denied';

export async function getOnboardingCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(StorageKeys.onboardingCompleted);
  return value === 'true';
}

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.onboardingCompleted, completed ? 'true' : 'false');
}

export async function getCurrentUserId(): Promise<string | null> {
  return AsyncStorage.getItem(StorageKeys.currentUserId);
}

export async function setCurrentUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.currentUserId, userId);
}

export async function removeCurrentUserId(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.currentUserId);
}

export async function getCheckInPreferences(): Promise<CheckInPreference | null> {
  const value = await AsyncStorage.getItem(StorageKeys.checkInPreferences);
  return value as CheckInPreference | null;
}

export async function setCheckInPreferences(preference: CheckInPreference): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.checkInPreferences, preference);
}

export async function removeCheckInPreferences(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.checkInPreferences);
}

export async function getNotificationPermission(): Promise<NotificationPermissionStatus | null> {
  const value = await AsyncStorage.getItem(StorageKeys.notificationPermission);
  if (value === 'allowed' || value === 'later' || value === 'denied') {
    return value;
  }

  return null;
}

export async function setNotificationPermission(
  status: NotificationPermissionStatus
): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.notificationPermission, status);
}

export async function removeNotificationPermission(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.notificationPermission);
}

export async function getActivePetId(): Promise<string | null> {
  return AsyncStorage.getItem(StorageKeys.activePetId);
}

export async function setActivePetId(petId: string): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.activePetId, petId);
}

export async function removeActivePetId(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.activePetId);
}
