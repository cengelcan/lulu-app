import type { SchedulableCheckInPreference } from '@/services/notifications/constants';

const REMINDER_BODY_BY_PREFERENCE: Record<SchedulableCheckInPreference, string> = {
  morning: 'How is {petName} today?',
  afternoon: 'Quick health check for {petName}.',
  evening: 'Any health changes today?',
};

export function getCheckInReminderContent(
  preference: SchedulableCheckInPreference,
  petName: string
): { title: string; body: string } {
  const bodyTemplate = REMINDER_BODY_BY_PREFERENCE[preference];
  const body = bodyTemplate.includes('{petName}')
    ? bodyTemplate.replace('{petName}', petName)
    : bodyTemplate;

  return {
    title: 'Pet Health Journal',
    body,
  };
}
