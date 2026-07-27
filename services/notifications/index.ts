export { configureNotificationHandler, ensureNotificationHandlerConfigured } from '@/services/notifications/handler';
export {
  getNotificationLaunchRoute,
  getRouteFromNotificationResponse,
  normalizeNotificationRoute,
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
  cancelAllMedicationDoseNotifications,
  syncMedicationDoseNotificationSchedule,
} from '@/services/notifications/medication-dose-schedule';
export {
  notifyMedicationRefillIfNeeded,
} from '@/services/notifications/medication-refill';
export { shouldSendMedicationRefillNotification } from '@/services/notifications/medication-refill-policy';
export {
  cancelCheckInReminder,
  syncCheckInReminderSchedule,
} from '@/services/notifications/schedule';
export {
  getUpcomingReminder,
  type UpcomingReminderDisplay,
} from '@/services/notifications/upcoming';
