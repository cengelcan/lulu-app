import {
  FREE_ACTIVE_PET_LIMIT,
  FREE_RECORDS_PER_MONTH,
  FREE_REMINDERS_PER_MONTH,
  PLUS_ACTIVE_PET_CAP,
  PLUS_DEV_BYPASS,
  type PlusFeature,
} from '@/constants/subscription';

export type PlusFeatureContext = {
  isPlusActive: boolean;
  ownedActivePetCount: number;
  recordsThisMonth: number;
  remindersThisMonth: number;
};

export function isPlusEntitled(isPlusActive: boolean): boolean {
  return isPlusActive || PLUS_DEV_BYPASS;
}

export function evaluatePlusFeature(feature: PlusFeature, context: PlusFeatureContext): boolean {
  const plus = isPlusEntitled(context.isPlusActive);

  switch (feature) {
    case 'multiplePets':
      return context.ownedActivePetCount < (plus ? PLUS_ACTIVE_PET_CAP : FREE_ACTIVE_PET_LIMIT);
    case 'familySharing':
    case 'pdfExport':
    case 'medicationInventory':
    case 'vetVisitWorkspace':
      return plus;
    case 'unlimitedRecords':
      return plus || context.recordsThisMonth < FREE_RECORDS_PER_MONTH;
    case 'unlimitedReminders':
      return plus || context.remindersThisMonth < FREE_REMINDERS_PER_MONTH;
    default:
      return plus;
  }
}
