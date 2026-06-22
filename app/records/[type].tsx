import type { Href } from 'expo-router';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { RecordNotesField } from '@/components/records/RecordNotesField';
import { RecordTypeFields } from '@/components/records/RecordTypeFields';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { RECORD_TYPES } from '@/constants/record-types';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import * as petRecordStorage from '@/storage/pet-record.storage';
import { usePetRecordStore } from '@/stores/pet-record.store';
import { usePetStore } from '@/stores/pet.store';
import {
  createDefaultMetadata,
  isRecordTypeId,
  PET_RECORD_NOTES_MAX_LENGTH,
  type PetRecord,
  type PetRecordMetadataByType,
  type RecordTypeId,
} from '@/types/pet-record';
import { formatLocalDate, getTodayStart } from '@/utils/date';
import { getRecordTypeLabelKey } from '@/utils/pet-record-display';
import { validatePetRecordForm } from '@/utils/pet-record-validation';

function createRecordId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeMetadataForSave<T extends RecordTypeId>(
  type: T,
  metadata: PetRecordMetadataByType[T]
): PetRecordMetadataByType[T] {
  switch (type) {
    case 'vet_visit': {
      const data = metadata as PetRecordMetadataByType['vet_visit'];
      return {
        clinicName: normalizeOptionalText(data.clinicName ?? ''),
        reason: normalizeOptionalText(data.reason ?? ''),
      } as PetRecordMetadataByType[T];
    }
    case 'vaccine': {
      const data = metadata as PetRecordMetadataByType['vaccine'];
      return {
        vaccineName: data.vaccineName.trim(),
        batchNumber: normalizeOptionalText(data.batchNumber ?? ''),
        nextDueDate: data.nextDueDate?.trim() ? data.nextDueDate.trim() : null,
      } as PetRecordMetadataByType[T];
    }
    case 'parasite': {
      const data = metadata as PetRecordMetadataByType['parasite'];
      return {
        productName: normalizeOptionalText(data.productName ?? ''),
      } as PetRecordMetadataByType[T];
    }
    case 'medication': {
      const data = metadata as PetRecordMetadataByType['medication'];
      return {
        medicationName: data.medicationName.trim(),
        dosage: normalizeOptionalText(data.dosage ?? ''),
        frequency: normalizeOptionalText(data.frequency ?? ''),
        endDate: data.endDate?.trim() ? data.endDate.trim() : null,
      } as PetRecordMetadataByType[T];
    }
    case 'vomiting':
      return metadata;
    case 'weight':
      return metadata;
    case 'other': {
      const data = metadata as PetRecordMetadataByType['other'];
      return {
        title: normalizeOptionalText(data.title ?? ''),
      } as PetRecordMetadataByType[T];
    }
  }
}

export default function RecordFormScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { type: typeParam, id: idParam } = useLocalSearchParams<{ type?: string; id?: string | string[] }>();

  const rawType = Array.isArray(typeParam) ? typeParam[0] : typeParam;
  const recordType = rawType && isRecordTypeId(rawType) ? rawType : null;
  const recordId = Array.isArray(idParam) ? idParam[0] : idParam;

  const pet = usePetStore((state) => state.pet);
  const loadPet = usePetStore((state) => state.loadPet);
  const createRecord = usePetRecordStore((state) => state.createRecord);
  const updateRecord = usePetRecordStore((state) => state.updateRecord);

  const [date, setDate] = useState(() => formatLocalDate(getTodayStart()));
  const [notes, setNotes] = useState('');
  const [metadata, setMetadata] = useState<PetRecordMetadataByType[RecordTypeId]>(() =>
    recordType ? createDefaultMetadata(recordType) : createDefaultMetadata('other')
  );
  const [existingRecord, setExistingRecord] = useState<PetRecord | null>(null);
  const [isHydrating, setIsHydrating] = useState(Boolean(recordId));
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const isEditMode = Boolean(recordId && existingRecord);
  const notesOverLimit = notes.length > PET_RECORD_NOTES_MAX_LENGTH;

  const screenTitle = useMemo(() => {
    if (!recordType) {
      return t('records.title');
    }

    return t(getRecordTypeLabelKey(recordType));
  }, [recordType, t]);

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  useEffect(() => {
    if (recordType) {
      return;
    }

    router.replace('/records' as Href);
  }, [recordType, router]);

  useEffect(() => {
    if (!recordType) {
      return;
    }

    if (!recordId) {
      setMetadata(createDefaultMetadata(recordType));
      setDate(formatLocalDate(getTodayStart()));
      setNotes('');
      setExistingRecord(null);
      setIsHydrating(false);
      return;
    }

    let cancelled = false;

    async function hydrateExistingRecord() {
      setIsHydrating(true);

      const existingId = recordId;

      if (!existingId) {
        setIsHydrating(false);
        return;
      }

      try {
        const record = await petRecordStorage.getPetRecordById(existingId);

        if (cancelled) {
          return;
        }

        if (!record || record.type !== recordType) {
          router.replace('/records' as Href);
          return;
        }

        setExistingRecord(record);
        setDate(record.date);
        setNotes(record.notes ?? '');
        setMetadata(record.metadata);
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
        }
      }
    }

    void hydrateExistingRecord();

    return () => {
      cancelled = true;
    };
  }, [recordId, recordType, router]);

  const handleSave = useCallback(async () => {
    if (!recordType || !pet?.id) {
      return;
    }

    const normalizedMetadata = normalizeMetadataForSave(recordType, metadata);
    const validationKey = validatePetRecordForm(
      recordType,
      date,
      normalizedMetadata,
      notes.length,
      PET_RECORD_NOTES_MAX_LENGTH
    );

    if (validationKey) {
      setValidationError(t(validationKey));
      return;
    }

    setValidationError(null);
    setIsSaving(true);

    const now = new Date().toISOString();
    const trimmedNotes = normalizeOptionalText(notes);

    try {
      if (isEditMode && existingRecord) {
        const updatedRecord = {
          ...existingRecord,
          date,
          notes: trimmedNotes,
          metadata: normalizedMetadata,
          updatedAt: now,
        } as PetRecord;

        await updateRecord(updatedRecord);
      } else {
        const newRecord = {
          id: createRecordId(),
          petId: pet.id,
          type: recordType,
          date,
          notes: trimmedNotes,
          metadata: normalizedMetadata,
          createdAt: now,
          updatedAt: now,
        } as PetRecord;

        await createRecord(newRecord);
      }

      router.back();
    } catch {
      setValidationError(t('records.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  }, [
    createRecord,
    date,
    existingRecord,
    isEditMode,
    metadata,
    notes,
    pet?.id,
    recordType,
    router,
    t,
    updateRecord,
  ]);

  if (!recordType) {
    return null;
  }

  const typeDefinition = RECORD_TYPES.find((item) => item.id === recordType);

  return (
    <>
      <Stack.Screen
        options={{
          ...STACK_BACK_ONLY_OPTIONS,
          headerShown: true,
          title: screenTitle,
        }}
      />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        {isHydrating ? (
          <View style={styles.centered}>
            <ActivityIndicator color={primaryColor} size="large" />
          </View>
        ) : (
          <>
            {typeDefinition ? (
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.intro}>
                {isEditMode ? t('records.editRecord') : t('records.addRecordType', {
                    type: t(typeDefinition.labelKey),
                  })}
              </ThemedText>
            ) : null}

            <GroupedSection title={t('records.sections.details')}>
              <View style={styles.sectionBody}>
                <View style={styles.field}>
                  <ThemedText type="defaultSemiBold">{t('records.fields.date')}</ThemedText>
                  <DatePickerField
                    accessibilityLabel={t('records.fields.date')}
                    placeholder={t('records.fields.datePlaceholder')}
                    value={date}
                    onChange={(value) => {
                      setValidationError(null);
                      setDate(value);
                    }}
                  />
                </View>

                <RecordTypeFields
                  metadata={metadata}
                  type={recordType}
                  onChangeMetadata={(nextMetadata) => {
                    setValidationError(null);
                    setMetadata(nextMetadata);
                  }}
                />
              </View>
            </GroupedSection>

            <GroupedSection title={t('records.sections.notes')}>
              <View style={styles.sectionBody}>
                <RecordNotesField
                  isOverLimit={notesOverLimit}
                  value={notes}
                  onChangeText={(value) => {
                    setValidationError(null);
                    setNotes(value);
                  }}
                />
              </View>
            </GroupedSection>

            {validationError ? (
              <ThemedText lightColor={primaryColor} darkColor={primaryColor} style={styles.error}>
                {validationError}
              </ThemedText>
            ) : null}

            <Button
              title={isEditMode ? t('records.saveChanges') : t('records.saveRecord')}
              disabled={isSaving || notesOverLimit}
              onPress={() => void handleSave()}
            />
          </>
        )}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  intro: {
    ...Typography.body,
    paddingHorizontal: Spacing.xs,
  },
  sectionBody: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  field: {
    gap: Spacing.xs,
  },
  error: {
    ...Typography.body,
    textAlign: 'center',
  },
});
