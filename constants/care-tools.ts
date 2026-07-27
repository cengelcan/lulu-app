import type { Href } from 'expo-router';

import type { IconSymbolName } from '@/components/ui/icon-symbol';

export type CareToolId =
  | 'check_in'
  | 'medications'
  | 'reminders'
  | 'vet_visits'
  | 'health_records';

export type CareToolDefinition = {
  id: CareToolId;
  titleKey: string;
  descriptionKey: string;
  icon: IconSymbolName;
  route: Href;
};

/** Visual order and VoiceOver order intentionally share this single source. */
export const CARE_TOOLS: readonly CareToolDefinition[] = [
  {
    id: 'check_in',
    titleKey: 'care.checkIn',
    descriptionKey: 'care.checkInDescription',
    icon: 'checkmark.circle.fill',
    route: '/check-in' as Href,
  },
  {
    id: 'medications',
    titleKey: 'medications.title',
    descriptionKey: 'medications.description',
    icon: 'pills.fill',
    route: '/medications' as Href,
  },
  {
    id: 'reminders',
    titleKey: 'care.reminders',
    descriptionKey: 'care.remindersDescription',
    icon: 'bell.fill',
    route: '/reminders' as Href,
  },
  {
    id: 'vet_visits',
    titleKey: 'vetVisits.prepare',
    descriptionKey: 'vetVisits.prepareDescription',
    icon: 'calendar.badge.checkmark',
    route: '/vet-visits' as Href,
  },
  {
    id: 'health_records',
    titleKey: 'care.records',
    descriptionKey: 'care.recordsDescription',
    icon: 'doc.text.fill',
    route: '/records' as Href,
  },
] as const;
