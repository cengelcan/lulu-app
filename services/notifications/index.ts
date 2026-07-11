export { configureNotificationHandler, ensureNotificationHandlerConfigured } from '@/services/notifications/handler';
export {
  getNotificationLaunchRoute,
  getRouteFromNotificationResponse,
} from '@/services/notifications/response';
export { resolveStoredNotificationPermission } from '@/services/notifications/permission-status';
export {
  hasNotificationPermission,
  requestNotificationPermission,
} from '@/services/notifications/permissions';
export {
  cancelAllPetReminderNotifications,
  cancelPetReminderNotification,
  syncPetReminderNotificationSchedule,
} from '@/services/notifications/pet-reminder-schedule';
export {
  cancelCheckInReminder,
  syncCheckInReminderSchedule,
} from '@/services/notifications/schedule';
export {
  getUpcomingReminder,
  type UpcomingReminderDisplay,
} from '@/services/notifications/upcoming';
