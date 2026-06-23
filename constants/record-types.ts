import type { IconSymbolName } from '@/components/ui/icon-symbol';
import type { RecordTypeId } from '@/types/pet-record';

export type { RecordTypeId };

export type RecordTypeLabelKey =
  | 'records.types.vetVisit'
  | 'records.types.vaccine'
  | 'records.types.parasite'
  | 'records.types.medication'
  | 'records.types.symptom'
  | 'records.types.weight'
  | 'records.types.operation'
  | 'records.types.testResult';

export type RecordTypeGridLabelKey =
  | 'records.grid.vetVisit'
  | 'records.grid.vaccine'
  | 'records.grid.parasite'
  | 'records.grid.medication'
  | 'records.grid.symptom'
  | 'records.grid.weight'
  | 'records.grid.operation'
  | 'records.grid.testResult';

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
    backgroundColor: '#9575D6',
  },
  {
    id: 'vaccine',
    icon: 'syringe.fill',
    labelKey: 'records.types.vaccine',
    gridLabelKey: 'records.grid.vaccine',
    backgroundColor: '#3B7FED',
  },
  {
    id: 'parasite',
    icon: 'ant.fill',
    labelKey: 'records.types.parasite',
    gridLabelKey: 'records.grid.parasite',
    backgroundColor: '#3EAD6B',
  },
  {
    id: 'medication',
    icon: 'pills.fill',
    labelKey: 'records.types.medication',
    gridLabelKey: 'records.grid.medication',
    backgroundColor: '#D44B58',
  },
  {
    id: 'symptom',
    icon: 'exclamationmark.triangle',
    labelKey: 'records.types.symptom',
    gridLabelKey: 'records.grid.symptom',
    backgroundColor: '#E88A32',
  },
  {
    id: 'weight',
    icon: 'scalemass.fill',
    labelKey: 'records.types.weight',
    gridLabelKey: 'records.grid.weight',
    backgroundColor: '#2EC4B6',
  },
  {
    id: 'operation',
    icon: 'staroflife.fill',
    labelKey: 'records.types.operation',
    gridLabelKey: 'records.grid.operation',
    backgroundColor: '#5C48B0',
  },
  {
    id: 'test_result',
    icon: 'doc.text.fill',
    labelKey: 'records.types.testResult',
    gridLabelKey: 'records.grid.testResult',
    backgroundColor: '#5A82A8',
  },
] as const;
