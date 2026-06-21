import type { IconSymbolName } from '@/components/ui/icon-symbol';

export type RecordTypeId =
  | 'vet_visit'
  | 'vaccine'
  | 'parasite'
  | 'medication'
  | 'vomiting'
  | 'weight'
  | 'other';

export type RecordTypeLabelKey =
  | 'records.types.vetVisit'
  | 'records.types.vaccine'
  | 'records.types.parasite'
  | 'records.types.medication'
  | 'records.types.vomiting'
  | 'records.types.weight'
  | 'records.types.other';

export type RecordTypeDefinition = {
  id: RecordTypeId;
  icon: IconSymbolName;
  labelKey: RecordTypeLabelKey;
};

export const RECORD_TYPES: readonly RecordTypeDefinition[] = [
  { id: 'vet_visit', icon: 'cross.case.fill', labelKey: 'records.types.vetVisit' },
  { id: 'vaccine', icon: 'syringe.fill', labelKey: 'records.types.vaccine' },
  { id: 'parasite', icon: 'ant.fill', labelKey: 'records.types.parasite' },
  { id: 'medication', icon: 'pills.fill', labelKey: 'records.types.medication' },
  { id: 'vomiting', icon: 'exclamationmark.triangle', labelKey: 'records.types.vomiting' },
  { id: 'weight', icon: 'scalemass.fill', labelKey: 'records.types.weight' },
  { id: 'other', icon: 'ellipsis.circle.fill', labelKey: 'records.types.other' },
] as const;
