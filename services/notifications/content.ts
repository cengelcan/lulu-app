import { translate } from '@/i18n';
import type { ResolvedLanguage } from '@/types/language';

export function getCheckInReminderContent(
  petName: string,
  language: ResolvedLanguage = 'en'
): { title: string; body: string } {
  return {
    title: translate(language, 'notifications.reminderTitle'),
    body: translate(language, 'notifications.reminderBody', { name: petName }),
  };
}
