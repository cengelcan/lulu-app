import type { ReminderTimeOfDay } from '@/types/pet-reminder';

export type MedicationPlanStatus = 'active' | 'completed' | 'archived';
export type MedicationScheduleFrequency = 'daily' | 'weekly' | 'custom';
export type MedicationDoseStatus = 'scheduled' | 'taken' | 'skipped' | 'missed' | 'snoozed';

export type MedicationPlan = {
  id: string;
  petId: string;
  name: string;
  form?: string | null;
  dosage: string;
  unit: string;
  instructions?: string | null;
  startsOn: string;
  endsOn?: string | null;
  timezone: string;
  isPrn: boolean;
  status: MedicationPlanStatus;
  createdAt: string;
  updatedAt: string;
};

export type MedicationSchedule = {
  id: string;
  planId: string;
  frequency: MedicationScheduleFrequency;
  interval: number;
  /** ISO weekday numbers: Monday = 1, Sunday = 7. */
  weekdays: number[];
  times: ReminderTimeOfDay[];
  effectiveFrom: string;
  effectiveTo?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MedicationDose = {
  id: string;
  planId: string;
  scheduleId?: string | null;
  petId: string;
  scheduledAt: string;
  localDate: string;
  localTime: ReminderTimeOfDay;
  timezone: string;
  status: MedicationDoseStatus;
  completedAt?: string | null;
  actorUserId?: string | null;
  note?: string | null;
  snoozedUntil?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MedicationInventory = {
  planId: string;
  petId: string;
  remainingDoses: number;
  refillThreshold: number;
  updatedAt: string;
};

export type MedicationPlanBundle = {
  plan: MedicationPlan;
  schedules: MedicationSchedule[];
  inventory?: MedicationInventory | null;
};
