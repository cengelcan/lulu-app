export type RecordTypeId =
  | 'vet_visit'
  | 'vaccine'
  | 'parasite'
  | 'medication'
  | 'symptom'
  | 'weight'
  | 'operation'
  | 'test_result';

export type SymptomSeverity = 'mild' | 'moderate' | 'severe';

export type WeightUnit = 'kg' | 'lb';

export type VetVisitMetadata = {
  clinicName?: string | null;
  reason?: string | null;
};

export type VaccineMetadata = {
  vaccineName: string;
  batchNumber?: string | null;
  nextDueDate?: string | null;
};

export type ParasiteMetadata = {
  productName?: string | null;
};

export type MedicationMetadata = {
  medicationName: string;
  dosage?: string | null;
  frequency?: string | null;
  endDate?: string | null;
};

export type SymptomMetadata = {
  symptomName: string;
  severity?: SymptomSeverity | null;
};

export type WeightMetadata = {
  value: number;
  unit: WeightUnit;
};

export type OperationMetadata = {
  procedureName: string;
  clinicName?: string | null;
};

export type TestResultMetadata = {
  testName: string;
};

/** @deprecated Legacy metadata — only used during migration from pre-symptom records. */
export type VomitingMetadata = {
  severity?: SymptomSeverity | null;
};

/** @deprecated Legacy metadata — only used during migration from pre-symptom records. */
export type OtherMetadata = {
  title?: string | null;
};

export type PetRecordMetadataByType = {
  vet_visit: VetVisitMetadata;
  vaccine: VaccineMetadata;
  parasite: ParasiteMetadata;
  medication: MedicationMetadata;
  symptom: SymptomMetadata;
  weight: WeightMetadata;
  operation: OperationMetadata;
  test_result: TestResultMetadata;
};

type BasePetRecord = {
  id: string;
  petId: string;
  /** Local calendar date (YYYY-MM-DD). */
  date: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PetRecord = {
  [K in RecordTypeId]: BasePetRecord & {
    type: K;
    metadata: PetRecordMetadataByType[K];
  };
}[RecordTypeId];

export type PetRecordInput<T extends RecordTypeId = RecordTypeId> = Omit<
  Extract<PetRecord, { type: T }>,
  'id' | 'createdAt' | 'updatedAt'
>;

export const PET_RECORD_NOTES_MAX_LENGTH = 500;

export const RECORD_TYPE_IDS: readonly RecordTypeId[] = [
  'vet_visit',
  'vaccine',
  'parasite',
  'medication',
  'symptom',
  'weight',
  'operation',
  'test_result',
] as const;

export function isRecordTypeId(value: string): value is RecordTypeId {
  return (RECORD_TYPE_IDS as readonly string[]).includes(value);
}

export function createDefaultMetadata<T extends RecordTypeId>(type: T): PetRecordMetadataByType[T] {
  switch (type) {
    case 'vet_visit':
      return { clinicName: null, reason: null } as PetRecordMetadataByType[T];
    case 'vaccine':
      return { vaccineName: '' } as PetRecordMetadataByType[T];
    case 'parasite':
      return { productName: null } as PetRecordMetadataByType[T];
    case 'medication':
      return { medicationName: '' } as PetRecordMetadataByType[T];
    case 'symptom':
      return { symptomName: '', severity: null } as PetRecordMetadataByType[T];
    case 'weight':
      return { value: 0, unit: 'kg' } as PetRecordMetadataByType[T];
    case 'operation':
      return { procedureName: '', clinicName: null } as PetRecordMetadataByType[T];
    case 'test_result':
      return { testName: '' } as PetRecordMetadataByType[T];
  }
}
