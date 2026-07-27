import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/constants/storage-keys';
import {
  normalizeContextualEducationDismissedState,
  type ContextualEducationDismissedState,
} from '@/utils/contextual-education';

export type ContextualEducationTopic = 'medication' | 'family' | 'vet_visit';

async function getDismissedState(): Promise<ContextualEducationDismissedState> {
  const stored = await AsyncStorage.getItem(StorageKeys.contextualEducationDismissed);
  if (!stored) return {};

  try {
    return normalizeContextualEducationDismissedState(JSON.parse(stored));
  } catch {
    return {};
  }
}

export async function isContextualEducationDismissed(
  topic: ContextualEducationTopic
): Promise<boolean> {
  return (await getDismissedState())[topic] === true;
}

export async function dismissContextualEducation(
  topic: ContextualEducationTopic
): Promise<void> {
  const current = await getDismissedState();
  await AsyncStorage.setItem(
    StorageKeys.contextualEducationDismissed,
    JSON.stringify({ ...current, [topic]: true })
  );
}

export async function clearContextualEducationDismissals(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.contextualEducationDismissed);
}
