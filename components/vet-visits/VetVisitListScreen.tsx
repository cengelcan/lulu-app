import { type Href, Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ContentState } from '@/components/ui/content-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useHubStackScreenOptions } from '@/hooks/use-hub-stack-screen-options';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { usePetStore } from '@/stores/pet.store';
import { useVetVisitStore } from '@/stores/vet-visit.store';
import { getLocaleTag } from '@/utils/locale';
import { getVetVisitPreparationProgress } from '@/utils/vet-visit';

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

  useFocusEffect(useCallback(() => {
    if (pet?.id) void loadVisits(pet.id);
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

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.body}>
          {t('vetVisits.description')}
        </ThemedText>
        <Button title={t('vetVisits.prepare')} onPress={() => router.push('/vet-visits/new' as Href)} />
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
                const progress = getVetVisitPreparationProgress(bundle);
                const dateLabel = new Date(bundle.visit.scheduledAt).toLocaleString(getLocaleTag(language), {
                  dateStyle: 'medium', timeStyle: 'short',
                });
                return (
                  <Pressable key={bundle.visit.id} accessibilityRole="button"
                    onPress={() => router.push(`/vet-visits/${bundle.visit.id}` as Href)}>
                    {({ pressed }) => (
                      <Card style={[styles.visitCard, { opacity: pressed ? 0.75 : 1 }]}>
                        <View style={[styles.icon, { backgroundColor: accentSoft }]}>
                          <IconSymbol name="calendar.badge.checkmark" size={22} color={accent} />
                        </View>
                        <View style={styles.copy}>
                          <ThemedText type="defaultSemiBold">{dateLabel}</ThemedText>
                          <ThemedText lightColor={secondary} darkColor={secondary}
                            style={Typography.caption} numberOfLines={2}>{bundle.visit.reason}</ThemedText>
                          <ThemedText lightColor={accent} darkColor={accent} style={styles.progress}>
                            {progress.completed === progress.total
                              ? t('vetVisits.ready')
                              : t('vetVisits.preparationProgress', progress)}
                          </ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={18} color={secondary} />
                      </Card>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
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
