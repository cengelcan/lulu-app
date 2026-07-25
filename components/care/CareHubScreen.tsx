import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { CareShortcutRow } from '@/components/care/CareShortcutRow';
import { InboxSectionView } from '@/components/inbox/InboxSection';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ContentState } from '@/components/ui/content-state';
import { LayoutTokens } from '@/constants/layout';
import { Spacing, Typography } from '@/constants/theme';
import { useInbox } from '@/hooks/use-inbox';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { InboxItem } from '@/types/inbox';
import { translateError } from '@/utils/translate-error';

type CareHubScreenProps = {
  edges?: Edge[];
};

export function CareHubScreen({ edges = ['top', 'bottom'] }: CareHubScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { sections, showPetName, isLoading, error, refresh } = useInbox();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const handleItemPress = (item: InboxItem) => {
    router.push(item.route);
  };

  return (
    <ScreenContainer
      scrollable
      edges={edges}
      maxContentWidth={LayoutTokens.readingContentMaxWidth}
      contentStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText accessibilityRole="header" style={styles.title}>
          {t('care.title')}
        </ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.subtitle}>
          {t('care.subtitle')}
        </ThemedText>
      </View>

      <View style={styles.section} testID="care-shortcuts">
        <ThemedText
          accessibilityRole="header"
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.sectionTitle}>
          {t('care.shortcutsTitle')}
        </ThemedText>
        <Card style={styles.listCard}>
          <CareShortcutRow
            title={t('care.checkIn')}
            description={t('care.checkInDescription')}
            icon="checkmark.circle.fill"
            onPress={() => router.push('/check-in')}
          />
          <CareShortcutRow
            title={t('medications.title')}
            description={t('medications.description')}
            icon="pills.fill"
            onPress={() => router.push('/medications' as Href)}
          />
          <CareShortcutRow
            title={t('care.reminders')}
            description={t('care.remindersDescription')}
            icon="bell.fill"
            onPress={() => router.push('/reminders')}
          />
          <CareShortcutRow
            title={t('care.records')}
            description={t('care.recordsDescription')}
            icon="doc.text.fill"
            isLast
            onPress={() => router.push('/records')}
          />
        </Card>
      </View>

      <View style={styles.section} testID="care-timeline">
        <ThemedText
          accessibilityRole="header"
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.sectionTitle}>
          {t('care.timelineTitle')}
        </ThemedText>
        <Button
          title={t('care.familyActivity')}
          variant="secondary"
          onPress={() => router.push('/family-activity' as Href)}
        />

        {isLoading ? (
          <ContentState
            kind="loading"
            accessibilityLabel={t('care.loadingTimeline')}
            style={styles.state}
          />
        ) : error ? (
          <ContentState
            kind="error"
            presentation="card"
            message={translateError(t, error)}
            actionLabel={t('common.tryAgain')}
            onActionPress={() => void refresh()}
          />
        ) : sections.length === 0 ? (
          <ContentState
            kind="empty"
            presentation="card"
            title={t('care.emptyTitle')}
            message={t('care.emptyDescription')}
          />
        ) : (
          <View style={styles.timelineSections}>
            {sections.map((section) => (
              <InboxSectionView
                key={section.category}
                section={section}
                showPetName={showPetName}
                onItemPress={handleItemPress}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  header: {
    gap: Spacing.xs,
  },
  title: {
    ...Typography.title,
  },
  subtitle: {
    ...Typography.body,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: Spacing.xs,
  },
  listCard: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
  timelineSections: {
    gap: Spacing.lg,
  },
  state: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
