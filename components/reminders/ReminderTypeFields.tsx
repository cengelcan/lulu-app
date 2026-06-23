import { RecordTextField } from '@/components/records/RecordTextField';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import type { ReminderMetadataByType, ReminderTypeId } from '@/types/pet-reminder';

type ReminderTypeFieldsProps = {
  type: ReminderTypeId;
  metadata: ReminderMetadataByType[ReminderTypeId];
  onChangeMetadata: (metadata: ReminderMetadataByType[ReminderTypeId]) => void;
};

export function ReminderTypeFields({ type, metadata, onChangeMetadata }: ReminderTypeFieldsProps) {
  const { t } = useTranslation();

  switch (type) {
    case 'vet_visit': {
      const data = metadata as ReminderMetadataByType['vet_visit'];
      return (
        <View style={styles.section}>
          <RecordTextField
            label={t('reminders.fields.title')}
            placeholder={t('reminders.fields.titlePlaceholder')}
            value={data.title ?? ''}
            onChangeText={(title) =>
              onChangeMetadata({ ...data, title: title.trim() ? title : null })
            }
          />
          <RecordTextField
            label={t('reminders.fields.clinicName')}
            optional
            placeholder={t('reminders.fields.clinicNamePlaceholder')}
            value={data.clinicName ?? ''}
            onChangeText={(clinicName) =>
              onChangeMetadata({ ...data, clinicName: clinicName.trim() ? clinicName : null })
            }
          />
        </View>
      );
    }
    case 'vaccine': {
      const data = metadata as ReminderMetadataByType['vaccine'];
      return (
        <View style={styles.section}>
          <RecordTextField
            label={t('reminders.fields.vaccineName')}
            placeholder={t('reminders.fields.vaccineNamePlaceholder')}
            value={data.vaccineName}
            onChangeText={(vaccineName) => onChangeMetadata({ ...data, vaccineName })}
          />
        </View>
      );
    }
    case 'parasite': {
      const data = metadata as ReminderMetadataByType['parasite'];
      return (
        <View style={styles.section}>
          <RecordTextField
            label={t('reminders.fields.productName')}
            placeholder={t('reminders.fields.productNamePlaceholder')}
            value={data.productName ?? ''}
            onChangeText={(productName) =>
              onChangeMetadata({ ...data, productName: productName.trim() ? productName : null })
            }
          />
        </View>
      );
    }
    case 'medication': {
      const data = metadata as ReminderMetadataByType['medication'];
      return (
        <View style={styles.section}>
          <RecordTextField
            label={t('reminders.fields.medicationName')}
            placeholder={t('reminders.fields.medicationNamePlaceholder')}
            value={data.medicationName}
            onChangeText={(medicationName) => onChangeMetadata({ ...data, medicationName })}
          />
        </View>
      );
    }
    case 'custom': {
      const data = metadata as ReminderMetadataByType['custom'];
      return (
        <View style={styles.section}>
          <RecordTextField
            label={t('reminders.fields.title')}
            placeholder={t('reminders.fields.customTitlePlaceholder')}
            value={data.title}
            onChangeText={(title) => onChangeMetadata({ ...data, title })}
          />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
});
