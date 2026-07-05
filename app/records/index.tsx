import type { Href } from 'expo-router';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { RecordHistoryRow } from '@/components/records/RecordHistoryRow';
import { RecordTypeGrid } from '@/components/records/RecordTypeGrid';
import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { RECORD_TYPES } from '@/constants/record-types';
import { Spacing, Typography } from '@/constants/theme';
import { useHubStackScreenOptions } from '@/hooks/use-hub-stack-screen-options';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { usePetRecordStore } from '@/stores/pet-record.store';
import { usePetStore } from '@/stores/pet.store';
import type { RecordTypeId } from '@/types/pet-record';
import { getLocaleTag } from '@/utils/locale';
import {
  formatRecordDate,
  getRecordFormRoute,
  getRecordSummary,
  getRecordTypeLabelKey,
} from '@/utils/pet-record-display';
import { canWritePetCareData } from '@/utils/pet-access';

const RECENT_RECORDS_LIMIT = 8;

export default function RecordsScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);

  const pet = usePetStore((state) => state.pet);
  const loadPet = usePetStore((state) => state.loadPet);
  const records = usePetRecordStore((state) => state.records);
  const isLoading = usePetRecordStore((state) => state.isLoading);
  const loadRecords = usePetRecordStore((state) => state.loadRecords);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  useFocusEffect(
    useCallback(() => {
      void loadPet();
    }, [loadPet])
  );

  useFocusEffect(
    useCallback(() => {
      if (!pet?.id) {
        return;
      }

      void loadRecords(pet.id);
    }, [loadRecords, pet?.id])
  );

  const handleRecordTypePress = (type: RecordTypeId) => {
    router.push(getRecordFormRoute(type) as Href);
  };

  const handleHistoryPress = (type: RecordTypeId, id: string) => {
    router.push(getRecordFormRoute(type, id) as Href);
  };

  const recentRecords = records.slice(0, RECENT_RECORDS_LIMIT);
  const isReadOnly = pet ? !canWritePetCareData(pet) : false;
  const screenOptions = useHubStackScreenOptions(t('records.title'));

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        {isReadOnly ? (
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.subtitle}>
            {t('records.deceasedReadOnly')}
          </ThemedText>
        ) : (
          <GroupedSection title={t('records.sectionTitle')}>
            <RecordTypeGrid
              getGridLabel={(key) => t(key)}
              onPressType={handleRecordTypePress}
            />
          </GroupedSection>
        )}

        {recentRecords.length > 0 ? (
          <GroupedSection title={t('records.recentTitle')}>
            {isLoading && recentRecords.length === 0 ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={primaryColor} />
              </View>
            ) : (
              recentRecords.map((record, index) => {
                const typeDefinition = RECORD_TYPES.find((item) => item.id === record.type);

                return (
                  <RecordHistoryRow
                    key={record.id}
                    backgroundColor={typeDefinition?.backgroundColor ?? '#6b7280'}
                    dateLabel={formatRecordDate(record.date, locale)}
                    icon={typeDefinition?.icon ?? 'doc.text.fill'}
                    isLast={index === recentRecords.length - 1}
                    subtitle={getRecordSummary(record, t)}
                    title={t(getRecordTypeLabelKey(record.type))}
                    onPress={() => handleHistoryPress(record.type, record.id)}
                  />
                );
              })
            )}
          </GroupedSection>
        ) : null}
      </ScreenContainer>
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
  loadingRow: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
});
