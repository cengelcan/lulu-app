import { type Href, Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ContentState } from '@/components/ui/content-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { PlusLockButtonIcon } from '@/components/ui/PlusLockIcon';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useHubStackScreenOptions } from '@/hooks/use-hub-stack-screen-options';
import { usePlusFeature } from '@/hooks/use-plus-feature';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { usePetStore } from '@/stores/pet.store';
import { useVetVisitStore } from '@/stores/vet-visit.store';
import type { VetVisitBundle } from '@/types/vet-visit';
import { getLocaleTag } from '@/utils/locale';
import { getVetVisitPreparationProgress } from '@/utils/vet-visit';
import { trackVetVisitEvent } from '@/services/analytics/vet-visit';

export function VetVisitListScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const pet = usePetStore((state) => state.pet);
  const bundles = useVetVisitStore((state) => state.bundles);
  const isLoading = useVetVisitStore((state) => state.isLoading);
  const loadVisits = useVetVisitStore((state) => state.loadVisits);
  const secondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');
  const accentSoft = useThemeColor({}, 'brandAccentSoft');
  const [referenceNow] = useState(Date.now);
  const screenOptions = useHubStackScreenOptions(t('vetVisits.title'));
  const { allowed: canCreateVisit, requestAccess } = usePlusFeature('vetVisitWorkspace');
  const hasVisitCreationAccess = canCreateVisit || pet?.sharingRole === 'member';

  useFocusEffect(useCallback(() => {
    if (pet?.id) void loadVisits(pet.id);
    void trackVetVisitEvent('workspace_opened', 'list');
  }, [loadVisits, pet]));
  const upcomingVisits = useMemo(
    () => bundles
      .filter(({ visit }) =>
        visit.petId === pet?.id &&
        visit.status === 'planned' &&
        new Date(visit.scheduledAt).getTime() >= referenceNow
      )
      .sort((a, b) => a.visit.scheduledAt.localeCompare(b.visit.scheduledAt)),
    [bundles, pet, referenceNow]
  );
  const inProgressVisits = useMemo(
    () => bundles.filter(({ visit }) => visit.petId === pet?.id && visit.status === 'in_progress'),
    [bundles, pet]
  );
  const completedVisits = useMemo(
    () => bundles
      .filter(({ visit }) => visit.petId === pet?.id && visit.status === 'completed')
      .sort((a, b) => (b.visit.completedAt ?? '').localeCompare(a.visit.completedAt ?? '')),
    [bundles, pet]
  );

  const renderVisitCard = (
    bundle: VetVisitBundle,
    route: Href,
    statusLabel?: string
  ) => {
    const progress = getVetVisitPreparationProgress(bundle);
    const dateLabel = new Date(bundle.visit.scheduledAt).toLocaleString(getLocaleTag(language), {
      dateStyle: 'medium', timeStyle: 'short',
    });
    return (
      <Pressable key={bundle.visit.id} accessibilityRole="button" onPress={() => router.push(route)}>
        {({ pressed }) => (
          <Card style={[styles.visitCard, { opacity: pressed ? 0.75 : 1 }]}>
            <View style={[styles.icon, { backgroundColor: accentSoft }]}>
              <IconSymbol name="calendar.badge.checkmark" size={22} color={accent} />
            </View>
            <View style={styles.copy}>
              <ThemedText type="defaultSemiBold">{dateLabel}</ThemedText>
              <ThemedText lightColor={secondary} darkColor={secondary}
                style={Typography.caption} numberOfLines={2}>
                {bundle.outcome?.userEnteredSummary ?? bundle.visit.reason}
              </ThemedText>
              <ThemedText lightColor={accent} darkColor={accent} style={styles.progress}>
                {statusLabel ?? (progress.completed === progress.total
                  ? t('vetVisits.ready')
                  : t('vetVisits.preparationProgress', progress))}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={secondary} />
          </Card>
        )}
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.body}>
          {t('vetVisits.description')}
        </ThemedText>
        <Button title={t('vetVisits.prepare')}
          trailingIcon={!hasVisitCreationAccess ? <PlusLockButtonIcon /> : undefined}
          onPress={() => {
            if (!hasVisitCreationAccess) {
              void trackVetVisitEvent('paywall_opened', 'list');
              requestAccess();
              return;
            }
            router.push('/vet-visits/new' as Href);
          }} />
        {inProgressVisits.length > 0 ? (
          <View style={styles.section}>
            <ThemedText lightColor={secondary} darkColor={secondary} style={styles.sectionTitle}>
              {t('vetVisits.inProgress')}
            </ThemedText>
            <View style={styles.visitList}>
              {inProgressVisits.map((bundle) => renderVisitCard(
                bundle, `/vet-visits/live/${bundle.visit.id}` as Href, t('vetVisits.continueVisit')
              ))}
            </View>
          </View>
        ) : null}
        <View style={styles.section}>
          <ThemedText lightColor={secondary} darkColor={secondary} style={styles.sectionTitle}>
            {t('vetVisits.upcomingTitle')}
          </ThemedText>
          {isLoading && bundles.length === 0 ? (
            <ContentState kind="loading" accessibilityLabel={t('common.loading')} />
          ) : upcomingVisits.length === 0 ? (
            <ContentState kind="empty" presentation="card" title={t('vetVisits.noUpcomingTitle')}
              message={t('vetVisits.noUpcomingDescription')} />
          ) : (
            <View style={styles.visitList}>
              {upcomingVisits.map((bundle) => {
                return renderVisitCard(bundle, `/vet-visits/${bundle.visit.id}` as Href);
              })}
            </View>
          )}
        </View>
        {completedVisits.length > 0 ? (
          <View style={styles.section}>
            <ThemedText lightColor={secondary} darkColor={secondary} style={styles.sectionTitle}>
              {t('vetVisits.pastTitle')}
            </ThemedText>
            <View style={styles.visitList}>
              {completedVisits.map((bundle) => renderVisitCard(
                bundle, `/vet-visits/outcome/${bundle.visit.id}` as Href, t('common.edit')
              ))}
            </View>
          </View>
        ) : null}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.lg },
  section: { gap: Spacing.xs },
  sectionTitle: { ...Typography.caption, textTransform: 'uppercase', letterSpacing: 0.4, paddingHorizontal: Spacing.xs },
  visitCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  visitList: { gap: Spacing.sm },
  icon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 2 },
  progress: { ...Typography.caption, fontWeight: '600' },
});
