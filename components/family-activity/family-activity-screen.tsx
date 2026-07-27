import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ActivityFilterChip } from '@/components/family-activity/activity-filter-chip';
import { InboxItemRow } from '@/components/inbox/InboxItemRow';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ContentState } from '@/components/ui/content-state';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { LayoutTokens } from '@/constants/layout';
import { Spacing, Typography } from '@/constants/theme';
import { useHubStackScreenOptions } from '@/hooks/use-hub-stack-screen-options';
import { useRegionalFormat } from '@/hooks/use-regional-format';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { useFamilyActivityStore } from '@/stores/family-activity.store';
import { usePetStore } from '@/stores/pet.store';
import type { InboxItem } from '@/types/inbox';
import { formatActivityRelativeTime } from '@/utils/activity-relative-time';
import {
  filterFamilyActivityEvents,
  isFamilyActivityUnread,
} from '@/utils/family-activity';
import { buildFamilyActivityItems } from '@/utils/inbox/providers/family-activity-provider';
import { translateError } from '@/utils/translate-error';

const ALL_FILTER = 'all';

export function FamilyActivityScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const regionalFormat = useRegionalFormat();
  const screenOptions = useHubStackScreenOptions(t('familyActivity.title'));
  const secondary = useThemeColor({}, 'textSecondary');
  const warning = useThemeColor({}, 'warning');
  const pets = usePetStore((state) => state.pets);
  const loadPets = usePetStore((state) => state.loadPets);
  const events = useFamilyActivityStore((state) => state.events);
  const actorDisplayNames = useFamilyActivityStore((state) => state.actorDisplayNames);
  const isLoading = useFamilyActivityStore((state) => state.isLoading);
  const isLoadingMore = useFamilyActivityStore((state) => state.isLoadingMore);
  const isOffline = useFamilyActivityStore((state) => state.isOffline);
  const lastReadAt = useFamilyActivityStore((state) => state.lastReadAt);
  const error = useFamilyActivityStore((state) => state.error);
  const nextCursor = useFamilyActivityStore((state) => state.nextCursor);
  const loadInitial = useFamilyActivityStore((state) => state.loadInitial);
  const loadMore = useFamilyActivityStore((state) => state.loadMore);
  const refresh = useFamilyActivityStore((state) => state.refresh);
  const markRead = useFamilyActivityStore((state) => state.markRead);
  const [petFilter, setPetFilter] = useState(ALL_FILTER);
  const [actorFilter, setActorFilter] = useState(ALL_FILTER);

  useFocusEffect(
    useCallback(() => {
      void loadPets();
      void loadInitial();
      return () => {
        void markRead();
      };
    }, [loadInitial, loadPets, markRead])
  );

  const visibleEvents = useMemo(
    () => filterFamilyActivityEvents(events, {
      petId: petFilter === ALL_FILTER ? null : petFilter,
      actorUserId: actorFilter === ALL_FILTER ? null : actorFilter,
    }),
    [actorFilter, events, petFilter]
  );

  const actors = useMemo(() => {
    const ids = [...new Set(events.map((event) => event.actorUserId))];
    return ids.map((id) => ({
      id,
      name: actorDisplayNames.get(id) ?? t('sharing.someone'),
    }));
  }, [actorDisplayNames, events, t]);

  const items = useMemo(() => {
    const built = buildFamilyActivityItems({
      pets,
      checkIns: [],
      reminders: [],
      vetVisits: [],
      permission: null,
      dismissedIds: new Set(),
      referenceDate: new Date(),
      regionalFormat,
      t,
      activityEvents: visibleEvents,
      actorDisplayNames,
    });
    const eventByItemId = new Map(visibleEvents.map((event) => [`family-${event.id}`, event]));
    return built.map((item) => {
      const event = eventByItemId.get(item.id);
      return {
        ...item,
        isUnread: Boolean(event && isFamilyActivityUnread(event, lastReadAt)),
        subtitleText: event
          ? formatActivityRelativeTime(event.occurredAt, regionalFormat.languageLocale)
          : undefined,
      };
    });
  }, [actorDisplayNames, lastReadAt, pets, regionalFormat, t, visibleEvents]);

  const handleItemPress = (item: InboxItem) => {
    router.push(item.route);
  };

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <ScreenContainer
        scrollable
        edges={['bottom']}
        maxContentWidth={LayoutTokens.readingContentMaxWidth}
        contentStyle={styles.content}>
        <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.body}>
          {t('familyActivity.description')}
        </ThemedText>

        {isOffline ? (
          <Card style={styles.offlineCard}>
            <ThemedText lightColor={warning} darkColor={warning} style={Typography.caption}>
              {t('familyActivity.offline')}
            </ThemedText>
          </Card>
        ) : null}

        {events.length > 0 ? (
          <View style={styles.filters}>
            <ThemedText
              accessibilityRole="header"
              lightColor={secondary}
              darkColor={secondary}
              style={styles.filterTitle}>
              {t('familyActivity.petFilter')}
            </ThemedText>
            <ScrollView
              horizontal
              contentContainerStyle={styles.chipRow}
              showsHorizontalScrollIndicator={false}>
              <ActivityFilterChip
                label={t('familyActivity.allPets')}
                selected={petFilter === ALL_FILTER}
                onPress={() => setPetFilter(ALL_FILTER)}
              />
              {pets.map((pet) => (
                <ActivityFilterChip
                  key={pet.id}
                  label={pet.name}
                  selected={petFilter === pet.id}
                  onPress={() => setPetFilter(pet.id)}
                />
              ))}
            </ScrollView>

            <ThemedText
              accessibilityRole="header"
              lightColor={secondary}
              darkColor={secondary}
              style={styles.filterTitle}>
              {t('familyActivity.actorFilter')}
            </ThemedText>
            <ScrollView
              horizontal
              contentContainerStyle={styles.chipRow}
              showsHorizontalScrollIndicator={false}>
              <ActivityFilterChip
                label={t('familyActivity.everyone')}
                selected={actorFilter === ALL_FILTER}
                onPress={() => setActorFilter(ALL_FILTER)}
              />
              {actors.map((actor) => (
                <ActivityFilterChip
                  key={actor.id}
                  label={actor.name}
                  selected={actorFilter === actor.id}
                  onPress={() => setActorFilter(actor.id)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {isLoading && events.length === 0 ? (
          <ContentState
            kind="loading"
            accessibilityLabel={t('familyActivity.loading')}
            style={styles.state}
          />
        ) : error && events.length === 0 ? (
          <ContentState
            kind="error"
            presentation="card"
            message={translateError(t, error)}
            actionLabel={t('common.tryAgain')}
            onActionPress={() => void refresh()}
          />
        ) : items.length === 0 ? (
          <ContentState
            kind="empty"
            presentation="card"
            title={events.length > 0
              ? t('familyActivity.noFilterResults')
              : t('familyActivity.emptyTitle')}
            message={events.length > 0
              ? t('familyActivity.noFilterResultsDescription')
              : t('familyActivity.emptyDescription')}
          />
        ) : (
          <Card style={styles.listCard}>
            {items.map((item, index) => (
              <InboxItemRow
                key={item.id}
                item={item}
                showPetName={pets.length > 1}
                isLast={index === items.length - 1}
                onPress={handleItemPress}
              />
            ))}
          </Card>
        )}

        {nextCursor ? (
          <Button
            title={isLoadingMore
              ? t('common.loading')
              : t('familyActivity.loadMore')}
            variant="secondary"
            disabled={isLoadingMore}
            onPress={() => void loadMore()}
          />
        ) : null}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  offlineCard: {
    padding: Spacing.md,
  },
  filters: {
    gap: Spacing.sm,
  },
  filterTitle: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: Spacing.xs,
  },
  chipRow: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  listCard: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
  state: {
    minHeight: 160,
  },
});
