import { StyleSheet, View } from 'react-native';

import { RecordTextField } from '@/components/records/RecordTextField';
import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { VOMITING_SEVERITY_OPTIONS, WEIGHT_UNIT_OPTIONS } from '@/constants/pet-record-form';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import type {
  PetRecordMetadataByType,
  RecordTypeId,
  VomitingSeverity,
  WeightUnit,
} from '@/types/pet-record';
import { parseWeightInput } from '@/utils/pet-record-validation';

type RecordTypeFieldsProps = {
  type: RecordTypeId;
  metadata: PetRecordMetadataByType[RecordTypeId];
  onChangeMetadata: (metadata: PetRecordMetadataByType[RecordTypeId]) => void;
};

export function RecordTypeFields({ type, metadata, onChangeMetadata }: RecordTypeFieldsProps) {
  const { t } = useTranslation();

  switch (type) {
    case 'vet_visit': {
      const data = metadata as PetRecordMetadataByType['vet_visit'];
      return (
        <View style={styles.section}>
          <RecordTextField
            label={t('records.fields.clinicName')}
            optional
            placeholder={t('records.fields.clinicNamePlaceholder')}
            value={data.clinicName ?? ''}
            onChangeText={(clinicName) =>
              onChangeMetadata({ ...data, clinicName: clinicName.trim() ? clinicName : null })
            }
          />
          <RecordTextField
            label={t('records.fields.reason')}
            optional
            placeholder={t('records.fields.reasonPlaceholder')}
            value={data.reason ?? ''}
            onChangeText={(reason) =>
              onChangeMetadata({ ...data, reason: reason.trim() ? reason : null })
            }
          />
        </View>
      );
    }
    case 'vaccine': {
      const data = metadata as PetRecordMetadataByType['vaccine'];
      return (
        <View style={styles.section}>
          <RecordTextField
            label={t('records.fields.vaccineName')}
            placeholder={t('records.fields.vaccineNamePlaceholder')}
            value={data.vaccineName}
            onChangeText={(vaccineName) => onChangeMetadata({ ...data, vaccineName })}
          />
          <RecordTextField
            label={t('records.fields.batchNumber')}
            optional
            placeholder={t('records.fields.batchNumberPlaceholder')}
            value={data.batchNumber ?? ''}
            onChangeText={(batchNumber) =>
              onChangeMetadata({ ...data, batchNumber: batchNumber.trim() ? batchNumber : null })
            }
          />
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <ThemedText type="defaultSemiBold">{t('records.fields.nextDueDate')}</ThemedText>
              <ThemedText lightColor={undefined} style={styles.optional}>
                {t('common.optional')}
              </ThemedText>
            </View>
            <DatePickerField
              accessibilityLabel={t('records.fields.nextDueDate')}
              maximumDate={null}
              minimumDate={new Date()}
              placeholder={t('records.fields.datePlaceholder')}
              value={data.nextDueDate ?? ''}
              onChange={(nextDueDate) =>
                onChangeMetadata({ ...data, nextDueDate: nextDueDate.trim() ? nextDueDate : null })
              }
            />
          </View>
        </View>
      );
    }
    case 'parasite': {
      const data = metadata as PetRecordMetadataByType['parasite'];
      return (
        <RecordTextField
          label={t('records.fields.productName')}
          optional
          placeholder={t('records.fields.productNamePlaceholder')}
          value={data.productName ?? ''}
          onChangeText={(productName) =>
            onChangeMetadata({ ...data, productName: productName.trim() ? productName : null })
          }
        />
      );
    }
    case 'medication': {
      const data = metadata as PetRecordMetadataByType['medication'];
      return (
        <View style={styles.section}>
          <RecordTextField
            label={t('records.fields.medicationName')}
            placeholder={t('records.fields.medicationNamePlaceholder')}
            value={data.medicationName}
            onChangeText={(medicationName) => onChangeMetadata({ ...data, medicationName })}
          />
          <RecordTextField
            label={t('records.fields.dosage')}
            optional
            placeholder={t('records.fields.dosagePlaceholder')}
            value={data.dosage ?? ''}
            onChangeText={(dosage) =>
              onChangeMetadata({ ...data, dosage: dosage.trim() ? dosage : null })
            }
          />
          <RecordTextField
            label={t('records.fields.frequency')}
            optional
            placeholder={t('records.fields.frequencyPlaceholder')}
            value={data.frequency ?? ''}
            onChangeText={(frequency) =>
              onChangeMetadata({ ...data, frequency: frequency.trim() ? frequency : null })
            }
          />
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <ThemedText type="defaultSemiBold">{t('records.fields.endDate')}</ThemedText>
              <ThemedText style={styles.optional}>{t('common.optional')}</ThemedText>
            </View>
            <DatePickerField
              accessibilityLabel={t('records.fields.endDate')}
              maximumDate={null}
              minimumDate={new Date()}
              placeholder={t('records.fields.datePlaceholder')}
              value={data.endDate ?? ''}
              onChange={(endDate) =>
                onChangeMetadata({ ...data, endDate: endDate.trim() ? endDate : null })
              }
            />
          </View>
        </View>
      );
    }
    case 'vomiting': {
      const data = metadata as PetRecordMetadataByType['vomiting'];
      return (
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <ThemedText type="defaultSemiBold">{t('records.fields.severity')}</ThemedText>
            <ThemedText style={styles.optional}>{t('common.optional')}</ThemedText>
          </View>
          <View style={styles.optionGroup}>
            {VOMITING_SEVERITY_OPTIONS.map((severity) => (
              <SelectableOption
                key={severity}
                label={t(`records.severity.${severity}`)}
                selected={data.severity === severity}
                onPress={() =>
                  onChangeMetadata({
                    ...data,
                    severity: data.severity === severity ? null : (severity as VomitingSeverity),
                  })
                }
              />
            ))}
          </View>
        </View>
      );
    }
    case 'weight': {
      const data = metadata as PetRecordMetadataByType['weight'];
      const weightText = data.value > 0 ? String(data.value) : '';

      return (
        <View style={styles.section}>
          <RecordTextField
            keyboardType="decimal-pad"
            label={t('records.fields.weightValue')}
            placeholder={t('records.fields.weightValuePlaceholder')}
            value={weightText}
            onChangeText={(value) =>
              onChangeMetadata({ ...data, value: parseWeightInput(value) })
            }
          />
          <ThemedText type="defaultSemiBold">{t('records.fields.weightUnit')}</ThemedText>
          <View style={styles.optionGroup}>
            {WEIGHT_UNIT_OPTIONS.map((unit) => (
              <SelectableOption
                key={unit}
                label={t(`records.units.${unit}`)}
                selected={data.unit === unit}
                onPress={() => onChangeMetadata({ ...data, unit: unit as WeightUnit })}
              />
            ))}
          </View>
        </View>
      );
    }
    case 'other': {
      const data = metadata as PetRecordMetadataByType['other'];
      return (
        <RecordTextField
          label={t('records.fields.title')}
          placeholder={t('records.fields.titlePlaceholder')}
          value={data.title ?? ''}
          onChangeText={(title) =>
            onChangeMetadata({ ...data, title: title.trim() ? title : null })
          }
        />
      );
    }
  }
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  field: {
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  optional: {
    opacity: 0.7,
  },
  optionGroup: {
    gap: Spacing.sm,
  },
});
