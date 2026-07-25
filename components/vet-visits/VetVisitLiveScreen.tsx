import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { RecordTextField } from '@/components/records/RecordTextField';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ContentState } from '@/components/ui/content-state';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing, Typography } from '@/constants/theme';
import { useHubStackScreenOptions } from '@/hooks/use-hub-stack-screen-options';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { trackVetVisitEvent } from '@/services/analytics/vet-visit';
import * as vetVisitStorage from '@/storage/vet-visit.storage';
import { usePetStore } from '@/stores/pet.store';
import { useUserStore } from '@/stores/user.store';
import { useVetVisitStore } from '@/stores/vet-visit.store';
import type { VetVisitBundle, VetVisitQuestion } from '@/types/vet-visit';
import { canWriteVetVisit } from '@/utils/pet-access';
import { startVetVisit } from '@/utils/vet-visit';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function VetVisitLiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const saveVisit = useVetVisitStore((state) => state.saveVisit);
  const pet = usePetStore((state) => state.pet);
  const userId = useUserStore((state) => state.userId);
  const [bundle, setBundle] = useState<VetVisitBundle | null>(null);
  const [questions, setQuestions] = useState<VetVisitQuestion[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const hasLoaded = useRef(false);
  const secondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');
  const screenOptions = useHubStackScreenOptions(t('vetVisits.liveTitle'), '/vet-visits' as Href);
  const isReadOnly = Boolean(bundle && pet && !canWriteVetVisit(pet, bundle.visit, userId));

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      const stored = await vetVisitStorage.getVetVisitBundle(id);
      if (!stored || cancelled) return;
      const canWrite = pet ? canWriteVetVisit(pet, stored.visit, userId) : false;
      const active = stored.visit.status === 'planned' && canWrite
        ? startVetVisit(stored, new Date().toISOString())
        : stored;
      if (active !== stored) {
        await saveVisit(active);
        void trackVetVisitEvent('visit_started', 'live');
      }
      if (cancelled) return;
      setBundle(active);
      setQuestions(active.questions);
      setGeneralNotes(active.visit.generalNotes ?? '');
      hasLoaded.current = true;
      setSaveState('saved');
    })();
    return () => { cancelled = true; };
  }, [id, pet, saveVisit, userId]);

  useEffect(() => {
    if (!bundle || !hasLoaded.current || isReadOnly) return;
    setSaveState('saving');
    const timer = setTimeout(() => {
      const updatedAt = new Date().toISOString();
      void saveVisit({
        ...bundle,
        visit: { ...bundle.visit, generalNotes: generalNotes.trim() || null, updatedAt },
        questions: questions.map((question) => ({ ...question, updatedAt })),
      }).then(() => setSaveState('saved')).catch(() => setSaveState('error'));
    }, 600);
    return () => clearTimeout(timer);
  }, [bundle, generalNotes, isReadOnly, questions, saveVisit]);

  const updateQuestion = (idToUpdate: string, patch: Partial<VetVisitQuestion>) => {
    setQuestions((current) => current.map((question) =>
      question.id === idToUpdate ? { ...question, ...patch } : question
    ));
  };

  const handleFinish = async () => {
    if (!bundle || isReadOnly) return;
    const updatedAt = new Date().toISOString();
    setSaveState('saving');
    try {
      await saveVisit({
        ...bundle,
        visit: { ...bundle.visit, generalNotes: generalNotes.trim() || null, updatedAt },
        questions: questions.map((question) => ({ ...question, updatedAt })),
      });
      router.replace(`/vet-visits/outcome/${bundle.visit.id}` as Href);
    } catch {
      setSaveState('error');
    }
  };

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}
        footer={isReadOnly ? undefined : <Button title={t('vetVisits.finishVisit')}
          disabled={!bundle || saveState === 'saving'} onPress={() => void handleFinish()} />}>
        <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.body}>
          {t('vetVisits.liveDescription')}
        </ThemedText>
        {!bundle ? (
          <ContentState kind="loading" accessibilityLabel={t('common.loading')} />
        ) : (
          <>
            <GroupedSection title={t('vetVisits.questions')} cardStyle={styles.formCard}>
              {questions.length === 0 ? (
                <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.body}>
                  {t('vetVisits.questionRequired')}
                </ThemedText>
              ) : questions.map((question) => (
                <View key={question.id} style={styles.question}>
                  <View style={styles.questionHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.questionText}>
                      {question.text}
                    </ThemedText>
                    <Switch accessibilityLabel={`${question.text}. ${t('vetVisits.answered')}`}
                      disabled={isReadOnly}
                      value={question.isAnswered}
                      onValueChange={(isAnswered) => updateQuestion(question.id, { isAnswered })} />
                  </View>
                  <RecordTextField label={t('vetVisits.answerNote')} value={question.answer ?? ''}
                    onChangeText={(answer) => updateQuestion(question.id, { answer: answer || null })}
                    placeholder={t('vetVisits.answerPlaceholder')} multiline maxLength={500} optional
                    editable={!isReadOnly} />
                </View>
              ))}
            </GroupedSection>
            <GroupedSection title={t('vetVisits.quickNotes')} cardStyle={styles.formCard}>
              <RecordTextField label={t('vetVisits.quickNotes')} value={generalNotes}
                onChangeText={setGeneralNotes} placeholder={t('vetVisits.quickNotesPlaceholder')}
                multiline maxLength={1500} optional editable={!isReadOnly} />
            </GroupedSection>
          </>
        )}
        {isReadOnly ? <ThemedText lightColor={secondary} darkColor={secondary} style={Typography.body}>
          {t('vetVisits.sharedVisitReadOnly')}
        </ThemedText> : null}
        <ThemedText accessibilityLiveRegion="polite"
          lightColor={saveState === 'error' ? undefined : saveState === 'saved' ? accent : secondary}
          darkColor={saveState === 'error' ? undefined : saveState === 'saved' ? accent : secondary}
          style={[Typography.caption, saveState === 'error' && styles.error]}>
          {saveState === 'saving' ? t('vetVisits.autoSaving')
            : saveState === 'error' ? t('vetVisits.saveFailed')
              : saveState === 'saved' ? t('vetVisits.savedOffline') : ''}
        </ThemedText>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.lg, paddingBottom: Spacing.xl },
  formCard: { padding: Spacing.md, gap: Spacing.lg },
  question: { gap: Spacing.sm },
  questionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  questionText: { flex: 1 },
  error: { color: '#ef4444' },
});
