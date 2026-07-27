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
import { CARE_TOOLS } from '@/constants/care-tools';
import { LayoutTokens } from '@/constants/layout';
import { Spacing, Typography } from '@/constants/theme';
import { useInbox } from '@/hooks/use-inbox';
import { useRegionalFormat } from '@/hooks/use-regional-format';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { trackVetVisitEvent } from '@/services/analytics/vet-visit';
import { usePetStore } from '@/stores/pet.store';
import { useVetVisitStore } from '@/stores/vet-visit.store';
import type { InboxItem } from '@/types/inbox';
import { formatDateTime } from '@/utils/formatters';
import { canViewReports } from '@/utils/pet-access';
import { translateError } from '@/utils/translate-error';
import { getUpcomingVetVisit, getVetVisitPreparationProgress } from '@/utils/vet-visit';

type CareHubScreenProps = {
  edges?: Edge[];
};

export function CareHubScreen({ edges = ['top', 'bottom'] }: CareHubScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const regionalFormat = useRegionalFormat();
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
  const attentionSections = useMemo(
    () => sections.filter((section) => section.category !== 'activity'),
    [sections]
  );
  const activitySections = useMemo(
    () => sections.filter((section) => section.category === 'activity'),
    [sections]
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

      <View style={styles.section} testID="care-attention">
        <ThemedText
          accessibilityRole="header"
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.sectionTitle}>
          {t('care.attentionTitle')}
        </ThemedText>

        {upcomingVetVisit ? (
          <View style={styles.attentionGroup} testID="care-upcoming-vet-visit">
            <ThemedText
              accessibilityRole="header"
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.subsectionTitle}>
              {t('vetVisits.upcomingTitle')}
            </ThemedText>
            <Card style={styles.upcomingCard}>
              <ThemedText type="defaultSemiBold">
                {formatDateTime(upcomingVetVisit.visit.scheduledAt, regionalFormat)}
              </ThemedText>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={Typography.caption}>
                {preparationProgress?.completed === preparationProgress?.total
                  ? t('vetVisits.ready')
                  : t(
                      'vetVisits.preparationProgress',
                      preparationProgress ?? { completed: 0, total: 3 }
                    )}
              </ThemedText>
              <Button
                title={
                  upcomingVetVisit.visit.status === 'in_progress'
                    ? t('vetVisits.continueVisit')
                    : t('common.edit')
                }
                variant="secondary"
                onPress={() => {
                  void trackVetVisitEvent('workspace_opened', 'care');
                  router.push(
                    (upcomingVetVisit.visit.status === 'in_progress'
                      ? `/vet-visits/live/${upcomingVetVisit.visit.id}`
                      : `/vet-visits/${upcomingVetVisit.visit.id}`) as Href
                  );
                }}
              />
            </Card>
          </View>
        ) : null}

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
        ) : attentionSections.length > 0 ? (
          <View style={styles.attentionSections}>
            {attentionSections.map((section) => (
              <InboxSectionView
                key={section.category}
                section={section}
                showPetName={showPetName}
                onItemPress={handleItemPress}
              />
            ))}
          </View>
        ) : !upcomingVetVisit ? (
          <ContentState
            kind="empty"
            presentation="card"
            title={t('care.emptyTitle')}
            message={t('care.emptyDescription')}
          />
        ) : null}
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
          {CARE_TOOLS.map((tool, index) => (
            <CareShortcutRow
              key={tool.id}
              title={t(tool.titleKey)}
              description={t(tool.descriptionKey)}
              icon={tool.icon}
              isLast={index === CARE_TOOLS.length - 1}
              onPress={() => {
                if (tool.id === 'vet_visits') {
                  void trackVetVisitEvent('workspace_opened', 'care');
                }
                router.push(tool.route);
              }}
            />
          ))}
        </Card>
      </View>

      <View style={styles.section} testID="care-resources">
        <ThemedText
          accessibilityRole="header"
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.sectionTitle}>
          {t('care.resourcesTitle')}
        </ThemedText>
        <Card style={styles.listCard}>
          {pet && canViewReports(pet) ? (
            <CareShortcutRow
              title={t('reports.title')}
              description={t('care.reportsDescription')}
              icon="chart.line.uptrend.xyaxis"
              onPress={() => router.push('/reports' as Href)}
            />
          ) : null}
          <CareShortcutRow
            title={t('familyActivity.title')}
            description={t('familyActivity.description')}
            icon="person.2.fill"
            isLast
            onPress={() => router.push('/family-activity' as Href)}
          />
        </Card>
      </View>

      {activitySections.length > 0 ? (
        <View style={styles.section} testID="care-timeline">
          <ThemedText
            accessibilityRole="header"
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.sectionTitle}>
            {t('care.timelineTitle')}
          </ThemedText>
          <View style={styles.timelineSections}>
            {activitySections.map((section) => (
              <InboxSectionView
                key={section.category}
                section={section}
                showPetName={showPetName}
                onItemPress={handleItemPress}
              />
            ))}
          </View>
        </View>
      ) : null}
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
  attentionGroup: {
    gap: Spacing.xs,
  },
  subsectionTitle: {
    ...Typography.caption,
    fontWeight: '600',
    paddingHorizontal: Spacing.xs,
  },
  attentionSections: {
    gap: Spacing.md,
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
