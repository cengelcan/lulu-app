import { translate } from '@/i18n';
import type { ResolvedLanguage } from '@/types/language';
import type { PetReminder } from '@/types/pet-reminder';
import { getReminderTitle } from '@/utils/pet-reminder-display';

export function getCheckInReminderContent(
  petName: string,
  language: ResolvedLanguage = 'en'
): { title: string; body: string } {
  return {
    title: translate(language, 'notifications.reminderTitle'),
    body: translate(language, 'notifications.reminderBody', { name: petName }),
  };
}

export function getPetReminderNotificationContent(
  reminder: PetReminder,
  petName: string,
  language: ResolvedLanguage = 'en'
): { title: string; body: string } {
  const title = getReminderTitle(reminder, (key) => translate(language, key));

  return {
    title,
    body: translate(language, 'notifications.petReminderBody', {
      name: petName,
      title,
    }),
  };
}
