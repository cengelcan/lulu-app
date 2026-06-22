import type { IconSymbolName } from '@/components/ui/icon-symbol';
import type { RecordTypeId } from '@/types/pet-record';

export type { RecordTypeId };

export type RecordTypeLabelKey =
  | 'records.types.vetVisit'
  | 'records.types.vaccine'
  | 'records.types.parasite'
  | 'records.types.medication'
  | 'records.types.vomiting'
  | 'records.types.weight'
  | 'records.types.other';

export type RecordTypeGridLabelKey =
  | 'records.grid.vetVisit'
  | 'records.grid.vaccine'
  | 'records.grid.parasite'
  | 'records.grid.medication'
  | 'records.grid.vomiting'
  | 'records.grid.weight'
  | 'records.grid.other';

export type RecordTypeDefinition = {
  id: RecordTypeId;
  icon: IconSymbolName;
  labelKey: RecordTypeLabelKey;
  gridLabelKey: RecordTypeGridLabelKey;
  backgroundColor: string;
};

export const RECORD_TYPES: readonly RecordTypeDefinition[] = [
  {
    id: 'vet_visit',
    icon: 'cross.case.fill',
    labelKey: 'records.types.vetVisit',
    gridLabelKey: 'records.grid.vetVisit',
    backgroundColor: '#E8D5FF',
  },
  {
    id: 'vaccine',
    icon: 'syringe.fill',
    labelKey: 'records.types.vaccine',
    gridLabelKey: 'records.grid.vaccine',
    backgroundColor: '#D4B8FF',
  },
  {
    id: 'parasite',
    icon: 'ant.fill',
    labelKey: 'records.types.parasite',
    gridLabelKey: 'records.grid.parasite',
    backgroundColor: '#D4F5A8',
  },
  {
    id: 'medication',
    icon: 'pills.fill',
    labelKey: 'records.types.medication',
    gridLabelKey: 'records.grid.medication',
    backgroundColor: '#FFD6E8',
  },
  {
    id: 'vomiting',
    icon: 'exclamationmark.triangle',
    labelKey: 'records.types.vomiting',
    gridLabelKey: 'records.grid.vomiting',
    backgroundColor: '#FFE4C4',
  },
  {
    id: 'weight',
    icon: 'scalemass.fill',
    labelKey: 'records.types.weight',
    gridLabelKey: 'records.grid.weight',
    backgroundColor: '#FFF3B0',
  },
  {
    id: 'other',
    icon: 'ellipsis.circle.fill',
    labelKey: 'records.types.other',
    gridLabelKey: 'records.grid.other',
    backgroundColor: '#E8E0F0',
  },
] as const;
