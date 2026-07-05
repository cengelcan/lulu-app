import { getTranslations, translate } from '@/i18n';
import type { ResolvedLanguage } from '@/types/language';
import type { PetReminder } from '@/types/pet-reminder';
import { getReminderTitle } from '@/utils/pet-reminder-display';

import {
  CHECK_IN_REMINDER_VARIANT_COUNT,
  pickCheckInReminderVariantIndex,
} from '@/services/notifications/check-in-reminder-variants';

function applyTranslationParams(
  template: string,
  params: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });
}

function getCheckInReminderBodies(language: ResolvedLanguage): readonly string[] {
  return getTranslations(language).notifications.reminderBodies;
}

export function getCheckInReminderContent(
  petName: string,
  language: ResolvedLanguage = 'en',
  variantIndex = 0
): { title: string; body: string } {
  const bodies = getCheckInReminderBodies(language);
  const safeIndex =
    ((variantIndex % bodies.length) + bodies.length) % bodies.length;
  const template = bodies[safeIndex] ?? bodies[0] ?? '';

  return {
    title: translate(language, 'notifications.reminderTitle'),
    body: applyTranslationParams(template, { name: petName }),
  };
}

export function getCheckInReminderContentForDate(
  petName: string,
  petId: string,
  dateKey: string,
  language: ResolvedLanguage = 'en'
): { title: string; body: string; variantIndex: number } {
  const variantIndex = pickCheckInReminderVariantIndex(
    dateKey,
    petId,
    CHECK_IN_REMINDER_VARIANT_COUNT
  );
  const { title, body } = getCheckInReminderContent(petName, language, variantIndex);

  return { title, body, variantIndex };
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
