import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { RecordTypeRow } from '@/components/records/RecordTypeRow';
import { ThemedText } from '@/components/themed-text';
import { ComingSoonModal } from '@/components/ui/ComingSoonModal';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { RECORD_TYPES } from '@/constants/record-types';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

export default function RecordsScreen() {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const [comingSoonVisible, setComingSoonVisible] = useState(false);

  const handleRecordTypePress = () => {
    setComingSoonVisible(true);
  };

  const handleDismissComingSoon = () => {
    setComingSoonVisible(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          ...STACK_BACK_ONLY_OPTIONS,
          headerShown: true,
          title: t('records.title'),
        }}
      />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.subtitle}>
          {t('records.addRecord')}
        </ThemedText>
        <GroupedSection title={t('records.sectionTitle')}>
          {RECORD_TYPES.map((recordType, index) => (
            <RecordTypeRow
              key={recordType.id}
              label={t(recordType.labelKey)}
              icon={recordType.icon}
              isLast={index === RECORD_TYPES.length - 1}
              onPress={handleRecordTypePress}
            />
          ))}
        </GroupedSection>
      </ScreenContainer>
      <ComingSoonModal visible={comingSoonVisible} onDismiss={handleDismissComingSoon} />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    paddingHorizontal: Spacing.xs,
  },
});
