import type { IconSymbolName } from '@/components/ui/icon-symbol';
import type { CheckInCategory } from '@/types/check-in';
import type { RecordTypeId } from '@/types/pet-record';

export type ReportRangePreset = '7d' | '30d' | '90d' | 'custom';

export type ReportWizardStep = 'range' | 'data' | 'review';

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

export type ReportCheckInFieldEntry = {
  key: ReportCheckInDataKey;
  emoji: string;
  label: string;
  value: string;
  isNormal: boolean;
};

export type ReportCheckInEntry = {
  date: string;
  fields: ReportCheckInFieldEntry[];
  notes?: string | null;
};

export type ReportRecordEntry = {
  date: string;
  time: string;
  typeId: RecordTypeId;
  icon: IconSymbolName;
  typeLabel: string;
  detail: string;
  notes?: string | null;
};

export type ReportRecordDayGroup = {
  date: string;
  entries: ReportRecordEntry[];
};

export type ReportPreviewContent = {
  startDate: string;
  endDate: string;
  checkIns: ReportCheckInEntry[];
  recordGroups: ReportRecordDayGroup[];
  isEmpty: boolean;
};

export type ReportPetSummary = {
  name: string;
  photoUri?: string | null;
  speciesLabel: string;
  breedLabel: string;
  sexLabel: string;
  birthDateLabel: string;
  spayNeuterLabel: string;
  weightLabel: string;
  ownerName: string;
  microchipId: string;
};

export type ReportDocumentLabels = {
  dailyObservations: string;
  recordsSection: string;
  notes: string;
  empty: string;
  owner: string;
  microchip: string;
  species: string;
  sex: string;
  birthDate: string;
  sterilization: string;
  weight: string;
  dayStatusNormal: string;
  dayStatusAlert: string;
  summaryTitle: string;
};

export type ReportSummaryLine = {
  /** 'normal' renders a positive accent, 'alert' a warning accent. */
  tone: 'normal' | 'alert' | 'neutral';
  text: string;
};

export type ReportSummary = {
  lines: ReportSummaryLine[];
};
