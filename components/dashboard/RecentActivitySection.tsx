import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DashboardSectionHeader } from '@/components/dashboard/DashboardSectionHeader';
import { RecordHistoryRow } from '@/components/records/RecordHistoryRow';
import { Card } from '@/components/ui/Card';
import { RECORD_TYPES } from '@/constants/record-types';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import type { PetRecord } from '@/types/pet-record';
import { getLocaleTag } from '@/utils/locale';
import {
  formatRecordDate,
  getRecordFormRoute,
  getRecordSummary,
  getRecordTypeLabelKey,
} from '@/utils/pet-record-display';

const HOME_RECENT_RECORDS_LIMIT = 3;

type RecentActivitySectionProps = {
  records: PetRecord[];
};

export function RecentActivitySection({ records }: RecentActivitySectionProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);
  const recentRecords = records.slice(0, HOME_RECENT_RECORDS_LIMIT);

  if (recentRecords.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <DashboardSectionHeader
        title={t('records.recentTitle')}
        icon="doc.text.fill"
        actionLabel={t('dashboard.seeAllRecords')}
        onActionPress={() => router.push('/records' as Href)}
      />
      <Card style={styles.card}>
        {recentRecords.map((record, index) => {
          const definition = RECORD_TYPES.find((item) => item.id === record.type);

          return (
            <RecordHistoryRow
              key={record.id}
              backgroundColor={definition?.backgroundColor ?? '#6b7280'}
              dateLabel={formatRecordDate(record.date, locale)}
              icon={definition?.icon ?? 'doc.text.fill'}
              isLast={index === recentRecords.length - 1}
              subtitle={getRecordSummary(record, t)}
              title={t(getRecordTypeLabelKey(record.type))}
              onPress={() => router.push(getRecordFormRoute(record.type, record.id) as Href)}
            />
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  card: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
});
