export { configureNotificationHandler } from '@/services/notifications/handler';
export {
  getNotificationLaunchRoute,
  getRouteFromNotificationResponse,
} from '@/services/notifications/response';
export {
  hasNotificationPermission,
  requestNotificationPermission,
} from '@/services/notifications/permissions';
export {
  cancelCheckInReminder,
  syncCheckInReminderSchedule,
} from '@/services/notifications/schedule';
