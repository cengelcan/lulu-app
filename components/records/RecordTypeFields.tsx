import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { RecordTextField } from '@/components/records/RecordTextField';
import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { DatePickerField } from '@/components/ui/DatePickerField';
import {
  SYMPTOM_SEVERITY_OPTIONS,
  SYMPTOM_SUGGESTION_KEYS,
  WEIGHT_UNIT_OPTIONS,
} from '@/constants/pet-record-form';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type {
  PetRecordMetadataByType,
  RecordTypeId,
  SymptomSeverity,
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
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const primaryTextColor = useThemeColor({}, 'primaryText');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');

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
    case 'symptom': {
      const data = metadata as PetRecordMetadataByType['symptom'];

      const handleSuggestionPress = (suggestion: string) => {
        if (process.env.EXPO_OS === 'ios') {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onChangeMetadata({ ...data, symptomName: suggestion });
      };

      return (
        <View style={styles.section}>
          <RecordTextField
            label={t('records.fields.symptomName')}
            placeholder={t('records.fields.symptomNamePlaceholder')}
            value={data.symptomName}
            onChangeText={(symptomName) => onChangeMetadata({ ...data, symptomName })}
          />
          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">{t('records.fields.symptomSuggestions')}</ThemedText>
            <View style={styles.suggestionGroup}>
              {SYMPTOM_SUGGESTION_KEYS.map((key) => {
                const label = t(key);
                const selected = data.symptomName.trim() === label;

                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => handleSuggestionPress(label)}
                    style={({ pressed }) => [
                      styles.suggestionChip,
                      {
                        backgroundColor: selected ? brandAccentColor : surfaceColor,
                        borderColor: selected ? brandAccentColor : borderColor,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}>
                    <ThemedText
                      type="defaultSemiBold"
                      lightColor={selected ? primaryTextColor : undefined}
                      darkColor={selected ? primaryTextColor : undefined}
                      style={styles.suggestionLabel}>
                      {label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <ThemedText type="defaultSemiBold">{t('records.fields.severity')}</ThemedText>
              <ThemedText style={styles.optional}>{t('common.optional')}</ThemedText>
            </View>
            <View style={styles.optionGroup}>
              {SYMPTOM_SEVERITY_OPTIONS.map((severity) => (
                <SelectableOption
                  key={severity}
                  label={t(`records.severity.${severity}`)}
                  selected={data.severity === severity}
                  onPress={() =>
                    onChangeMetadata({
                      ...data,
                      severity: data.severity === severity ? null : (severity as SymptomSeverity),
                    })
                  }
                />
              ))}
            </View>
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
    case 'operation': {
      const data = metadata as PetRecordMetadataByType['operation'];
      return (
        <View style={styles.section}>
          <RecordTextField
            label={t('records.fields.procedureName')}
            placeholder={t('records.fields.procedureNamePlaceholder')}
            value={data.procedureName}
            onChangeText={(procedureName) => onChangeMetadata({ ...data, procedureName })}
          />
          <RecordTextField
            label={t('records.fields.clinicName')}
            optional
            placeholder={t('records.fields.clinicNamePlaceholder')}
            value={data.clinicName ?? ''}
            onChangeText={(clinicName) =>
              onChangeMetadata({ ...data, clinicName: clinicName.trim() ? clinicName : null })
            }
          />
        </View>
      );
    }
    case 'test_result': {
      const data = metadata as PetRecordMetadataByType['test_result'];
      return (
        <RecordTextField
          label={t('records.fields.testName')}
          placeholder={t('records.fields.testNamePlaceholder')}
          value={data.testName}
          onChangeText={(testName) => onChangeMetadata({ ...data, testName })}
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
  suggestionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  suggestionChip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  suggestionLabel: {
    ...Typography.caption,
  },
});
