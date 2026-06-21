import type { CheckInCategory } from '@/types/check-in';
import type { RecordTypeId } from '@/types/pet-record';

export type ReportRangePreset = '7d' | '30d' | '90d' | 'custom';

export type ReportWizardStep = 'range' | 'data' | 'preview';

export type ReportCheckInDataKey = CheckInCategory | 'notes';

export type ReportRecordDataKey = RecordTypeId;

export type ReportDataSelection = {
  checkIn: Record<ReportCheckInDataKey, boolean>;
  records: Record<ReportRecordDataKey, boolean>;
};

export type ReportDateRange = {
  preset: ReportRangePreset;
  startDate: string;
  endDate: string;
};

export type ReportCheckInEntry = {
  date: string;
  fields: { label: string; value: string }[];
  notes?: string | null;
};

export type ReportRecordEntry = {
  date: string;
  typeLabel: string;
  detail: string;
  notes?: string | null;
};

export type ReportPreviewContent = {
  startDate: string;
  endDate: string;
  checkIns: ReportCheckInEntry[];
  records: ReportRecordEntry[];
  isEmpty: boolean;
};

export type ReportPetSummary = {
  name: string;
  species: string;
  breed: string;
  ageGroup: string;
};
