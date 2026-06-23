import type { IconSymbolName } from '@/components/ui/icon-symbol';
import type { ReminderTypeId } from '@/types/pet-reminder';

export type { ReminderTypeId };

export type ReminderTypeLabelKey =
  | 'reminders.types.vetVisit'
  | 'reminders.types.vaccine'
  | 'reminders.types.parasite'
  | 'reminders.types.medication'
  | 'reminders.types.custom';

export type ReminderTypeGridLabelKey =
  | 'reminders.grid.vetVisit'
  | 'reminders.grid.vaccine'
  | 'reminders.grid.parasite'
  | 'reminders.grid.medication'
  | 'reminders.grid.custom';

export type ReminderTypeDefinition = {
  id: ReminderTypeId;
  icon: IconSymbolName;
  labelKey: ReminderTypeLabelKey;
  gridLabelKey: ReminderTypeGridLabelKey;
  gridSubtitleKey?: 'reminders.grid.customSubtitle';
  backgroundColor: string;
};

export const REMINDER_TYPES: readonly ReminderTypeDefinition[] = [
  {
    id: 'vaccine',
    icon: 'syringe.fill',
    labelKey: 'reminders.types.vaccine',
    gridLabelKey: 'reminders.grid.vaccine',
    backgroundColor: '#3B7FED',
  },
  {
    id: 'medication',
    icon: 'pills.fill',
    labelKey: 'reminders.types.medication',
    gridLabelKey: 'reminders.grid.medication',
    backgroundColor: '#9575D6',
  },
  {
    id: 'parasite',
    icon: 'ant.fill',
    labelKey: 'reminders.types.parasite',
    gridLabelKey: 'reminders.grid.parasite',
    backgroundColor: '#3EAD6B',
  },
  {
    id: 'vet_visit',
    icon: 'cross.case.fill',
    labelKey: 'reminders.types.vetVisit',
    gridLabelKey: 'reminders.grid.vetVisit',
    backgroundColor: '#7C5CBF',
  },
  {
    id: 'custom',
    icon: 'calendar',
    labelKey: 'reminders.types.custom',
    gridLabelKey: 'reminders.grid.custom',
    gridSubtitleKey: 'reminders.grid.customSubtitle',
    backgroundColor: '#E88A32',
  },
] as const;
