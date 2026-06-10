import type { NotificationPermissionStatus } from '@/storage/prefs.storage';

export function resolveStoredNotificationPermission(
  requested: NotificationPermissionStatus,
  osGranted: boolean
): NotificationPermissionStatus {
  if (requested === 'allowed') {
    return osGranted ? 'allowed' : 'denied';
  }

  return requested;
}
