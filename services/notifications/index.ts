export { configureNotificationHandler } from '@/services/notifications/handler';
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
  cancelCheckInReminder,
  syncCheckInReminderSchedule,
} from '@/services/notifications/schedule';
export {
  getUpcomingReminder,
  type UpcomingReminderDisplay,
} from '@/services/notifications/upcoming';
