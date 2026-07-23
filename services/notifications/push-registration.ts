import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import { getExpoNotificationsModule } from '@/services/notifications/expo-notifications-module';
import { hasNotificationPermission } from '@/services/notifications/permissions';
import { getExpoPushToken, setExpoPushToken } from '@/storage/prefs.storage';

function getProjectId(): string {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  if (typeof projectId !== 'string' || projectId.length === 0) {
    throw new Error('Expo project ID is unavailable');
  }

  return projectId;
}

async function resolveExpoPushToken(): Promise<string | null> {
  if (Platform.OS === 'web' || !(await hasNotificationPermission())) {
    return null;
  }

  const Notifications = await getExpoNotificationsModule();
  if (!Notifications) {
    return null;
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({ projectId: getProjectId() })
  ).data as string;

  await setExpoPushToken(token);
  return token;
}

export async function registerFamilyActivityPushToken(): Promise<boolean> {
  const token = await resolveExpoPushToken();
  if (!token) {
    return false;
  }

  const { error } = await supabase.rpc('register_push_token', {
    p_expo_push_token: token,
    p_platform: Platform.OS,
  });

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function unregisterFamilyActivityPushToken(): Promise<void> {
  const token = await getExpoPushToken();
  if (!token) {
    return;
  }

  const { error } = await supabase.rpc('unregister_push_token', {
    p_expo_push_token: token,
  });

  if (error) {
    throw new Error(error.message);
  }
}
