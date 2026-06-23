export type ReminderTypeId = 'vet_visit' | 'vaccine' | 'parasite' | 'medication' | 'custom';

export type ReminderStatus = 'pending' | 'completed';

export type ReminderTimeOfDay = {
  hour: number;
  minute: number;
};

export type ReminderRecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type ReminderRecurrence = {
  frequency: ReminderRecurrenceFrequency;
};

export const DEFAULT_REMINDER_RECURRENCE: ReminderRecurrence = { frequency: 'none' };

export type CustomReminderMetadata = {
  title: string;
};

export type VetVisitReminderMetadata = {
  title?: string | null;
  clinicName?: string | null;
};

export type VaccineReminderMetadata = {
  vaccineName: string;
};

export type ParasiteReminderMetadata = {
  productName?: string | null;
};

export type MedicationReminderMetadata = {
  medicationName: string;
};

export type ReminderMetadataByType = {
  vet_visit: VetVisitReminderMetadata;
  vaccine: VaccineReminderMetadata;
  parasite: ParasiteReminderMetadata;
  medication: MedicationReminderMetadata;
  custom: CustomReminderMetadata;
};

type BasePetReminder = {
  id: string;
  petId: string;
  /** Local calendar date (YYYY-MM-DD). */
  dueDate: string;
  dueTime: ReminderTimeOfDay;
  notes?: string | null;
  recurrence: ReminderRecurrence;
  status: ReminderStatus;
  completedAt?: string | null;
  /** Set when completed — links to the auto-created health record. */
  recordId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PetReminder = {
  [K in ReminderTypeId]: BasePetReminder & {
    type: K;
    metadata: ReminderMetadataByType[K];
  };
}[ReminderTypeId];

export type PetReminderInput<T extends ReminderTypeId = ReminderTypeId> = Omit<
  Extract<PetReminder, { type: T }>,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'completedAt' | 'recordId'
>;

export const PET_REMINDER_NOTES_MAX_LENGTH = 500;

export const REMINDER_TYPE_IDS: readonly ReminderTypeId[] = [
  'vet_visit',
  'vaccine',
  'parasite',
  'medication',
  'custom',
] as const;

export function isReminderTypeId(value: string): value is ReminderTypeId {
  return (REMINDER_TYPE_IDS as readonly string[]).includes(value);
}

export function createDefaultReminderMetadata<T extends ReminderTypeId>(
  type: T
): ReminderMetadataByType[T] {
  switch (type) {
    case 'vet_visit':
      return { title: null, clinicName: null } as ReminderMetadataByType[T];
    case 'vaccine':
      return { vaccineName: '' } as ReminderMetadataByType[T];
    case 'parasite':
      return { productName: null } as ReminderMetadataByType[T];
    case 'medication':
      return { medicationName: '' } as ReminderMetadataByType[T];
    case 'custom':
      return { title: '' } as ReminderMetadataByType[T];
  }
}
