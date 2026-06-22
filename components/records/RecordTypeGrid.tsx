import { StyleSheet, View } from 'react-native';

import { RECORD_TYPES } from '@/constants/record-types';
import type { RecordTypeGridLabelKey } from '@/constants/record-types';
import { Spacing } from '@/constants/theme';
import type { RecordTypeId } from '@/types/pet-record';

import { RecordTypeGridItem } from './RecordTypeGridItem';

type RecordTypeGridProps = {
  onPressType: (type: RecordTypeId) => void;
  getGridLabel: (key: RecordTypeGridLabelKey) => string;
};

export function RecordTypeGrid({ onPressType, getGridLabel }: RecordTypeGridProps) {
  return (
    <View style={styles.grid}>
      {RECORD_TYPES.map((recordType) => (
        <RecordTypeGridItem
          key={recordType.id}
          label={getGridLabel(recordType.gridLabelKey)}
          icon={recordType.icon}
          backgroundColor={recordType.backgroundColor}
          onPress={() => onPressType(recordType.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
});
