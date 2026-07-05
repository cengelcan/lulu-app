import {
  FREE_ACTIVE_PET_LIMIT,
  FREE_RECORDS_PER_MONTH,
  FREE_REMINDERS_PER_MONTH,
  PLUS_ACTIVE_PET_CAP,
  PLUS_DEV_BYPASS,
  type PlusFeature,
} from '@/constants/subscription';
import { getDatabase } from '@/storage/database';
import type { Pet } from '@/types/pet';

export function getCalendarMonthBoundsIso(referenceDate = new Date()): {
  start: string;
  end: string;
} {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const start = new Date(year, month, 1).toISOString();
  const end = new Date(year, month + 1, 1).toISOString();
  return { start, end };
}

export function countOwnedActivePets(pets: Pet[]): number {
  return pets.filter(
    (pet) => pet.status !== 'deceased' && (pet.sharingRole ?? 'owner') === 'owner'
  ).length;
}

export async function countOwnedRecordsCreatedThisMonth(): Promise<number> {
  const db = await getDatabase();
  const { start, end } = getCalendarMonthBoundsIso();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM pet_records pr
     JOIN pets p ON p.id = pr.pet_id
     WHERE COALESCE(p.sharing_role, 'owner') = 'owner'
       AND pr.created_at >= ?
       AND pr.created_at < ?`,
    start,
    end
  );

  return row?.count ?? 0;
}

export async function countOwnedRemindersCreatedThisMonth(): Promise<number> {
  const db = await getDatabase();
  const { start, end } = getCalendarMonthBoundsIso();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM pet_reminders pr
     JOIN pets p ON p.id = pr.pet_id
     WHERE COALESCE(p.sharing_role, 'owner') = 'owner'
       AND pr.created_at >= ?
       AND pr.created_at < ?`,
    start,
    end
  );

  return row?.count ?? 0;
}

export function isPlusEntitled(isPlusActive: boolean): boolean {
  return isPlusActive || PLUS_DEV_BYPASS;
}

export type PlusFeatureContext = {
  isPlusActive: boolean;
  ownedActivePetCount: number;
  recordsThisMonth: number;
  remindersThisMonth: number;
};

export function evaluatePlusFeature(feature: PlusFeature, context: PlusFeatureContext): boolean {
  const plus = isPlusEntitled(context.isPlusActive);

  switch (feature) {
    case 'multiplePets':
      if (plus) {
        return context.ownedActivePetCount < PLUS_ACTIVE_PET_CAP;
      }
      return context.ownedActivePetCount < FREE_ACTIVE_PET_LIMIT;
    case 'familySharing':
    case 'pdfExport':
      return plus;
    case 'unlimitedRecords':
      return plus || context.recordsThisMonth < FREE_RECORDS_PER_MONTH;
    case 'unlimitedReminders':
      return plus || context.remindersThisMonth < FREE_REMINDERS_PER_MONTH;
    default:
      return plus;
  }
}

export async function buildPlusFeatureContext(
  isPlusActive: boolean,
  pets: Pet[]
): Promise<PlusFeatureContext> {
  const [recordsThisMonth, remindersThisMonth] = await Promise.all([
    countOwnedRecordsCreatedThisMonth(),
    countOwnedRemindersCreatedThisMonth(),
  ]);

  return {
    isPlusActive,
    ownedActivePetCount: countOwnedActivePets(pets),
    recordsThisMonth,
    remindersThisMonth,
  };
}

export async function canUsePlusFeature(
  feature: PlusFeature,
  isPlusActive: boolean,
  pets: Pet[]
): Promise<boolean> {
  const context = await buildPlusFeatureContext(isPlusActive, pets);
  return evaluatePlusFeature(feature, context);
}
