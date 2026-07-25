import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
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
import { usePetStore } from '@/stores/pet.store';
import { useVetVisitStore } from '@/stores/vet-visit.store';
import type { InboxItem } from '@/types/inbox';
import { getLocaleTag } from '@/utils/locale';
import { translateError } from '@/utils/translate-error';
import { getUpcomingVetVisit, getVetVisitPreparationProgress } from '@/utils/vet-visit';

type CareHubScreenProps = {
  edges?: Edge[];
};

export function CareHubScreen({ edges = ['top', 'bottom'] }: CareHubScreenProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { sections, showPetName, isLoading, error, refresh } = useInbox();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const pet = usePetStore((state) => state.pet);
  const vetVisitBundles = useVetVisitStore((state) => state.bundles);
  const loadVetVisits = useVetVisitStore((state) => state.loadVisits);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      if (pet?.id) void loadVetVisits(pet.id);
    }, [loadVetVisits, pet, refresh])
  );

  const upcomingVetVisit = useMemo(
    () => getUpcomingVetVisit(vetVisitBundles.filter(({ visit }) => visit.petId === pet?.id)),
    [pet, vetVisitBundles]
  );
  const preparationProgress = upcomingVetVisit
    ? getVetVisitPreparationProgress(upcomingVetVisit)
    : null;

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

      {upcomingVetVisit ? (
        <View style={styles.section} testID="care-upcoming-vet-visit">
          <ThemedText
            accessibilityRole="header"
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.sectionTitle}>
            {t('vetVisits.upcomingTitle')}
          </ThemedText>
          <Card style={styles.upcomingCard}>
            <ThemedText type="defaultSemiBold">
              {new Date(upcomingVetVisit.visit.scheduledAt).toLocaleString(getLocaleTag(language), {
                dateStyle: 'medium', timeStyle: 'short',
              })}
            </ThemedText>
            <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor} style={Typography.caption}>
              {preparationProgress?.completed === preparationProgress?.total
                ? t('vetVisits.ready')
                : t('vetVisits.preparationProgress', preparationProgress ?? { completed: 0, total: 3 })}
            </ThemedText>
            <Button title={upcomingVetVisit.visit.status === 'in_progress'
              ? t('vetVisits.continueVisit') : t('common.edit')} variant="secondary"
              onPress={() => router.push((upcomingVetVisit.visit.status === 'in_progress'
                ? `/vet-visits/live/${upcomingVetVisit.visit.id}`
                : `/vet-visits/${upcomingVetVisit.visit.id}`) as Href)} />
          </Card>
        </View>
      ) : null}

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
            title={t('vetVisits.prepare')}
            description={t('vetVisits.prepareDescription')}
            icon="calendar.badge.checkmark"
            onPress={() => router.push('/vet-visits' as Href)}
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
  upcomingCard: {
    gap: Spacing.sm,
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
