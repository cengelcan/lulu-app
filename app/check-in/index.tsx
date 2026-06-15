import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CheckInCategorySection } from '@/components/check-in/CheckInCategorySection';
import { CheckInNotesSection } from '@/components/check-in/CheckInNotesSection';
import { CheckInProgress } from '@/components/check-in/CheckInProgress';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { CHECK_IN_CATEGORIES, CHECK_IN_NOTES_MAX_LENGTH } from '@/constants/check-in';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { useCheckInStore } from '@/stores/check-in.store';
import { usePetStore } from '@/stores/pet.store';
import type {
  Appetite,
  CheckIn,
  CheckInFormValues,
  Energy,
  Mood,
  Pee,
  Poop,
  WaterIntake,
} from '@/types/check-in';
import { countCompletedCheckInFields, isCheckInFormComplete } from '@/utils/check-in';
import {
  formatCheckInTitleDate,
  formatLocalDate,
  getTodayStart,
  isFutureLocalDate,
  isTodayLocalDate,
  isValidLocalDateString,
  parseLocalDate,
} from '@/utils/date';

function createCheckInId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getTodayDateString(): string {
  return formatLocalDate(getTodayStart());
}

export default function CheckInScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { date: dateParam } = useLocalSearchParams<{ date?: string | string[] }>();

  const pet = usePetStore((state) => state.pet);
  const petIsLoading = usePetStore((state) => state.isLoading);
  const loadPet = usePetStore((state) => state.loadPet);

  const checkIns = useCheckInStore((state) => state.checkIns);
  const loadCheckIns = useCheckInStore((state) => state.loadCheckIns);
  const createCheckIn = useCheckInStore((state) => state.createCheckIn);
  const updateCheckIn = useCheckInStore((state) => state.updateCheckIn);
  const checkInIsLoading = useCheckInStore((state) => state.isLoading);
  const checkInError = useCheckInStore((state) => state.error);
  const clearCheckInError = useCheckInStore((state) => state.clearError);

  const [appetite, setAppetite] = useState<Appetite | null>(null);
  const [waterIntake, setWaterIntake] = useState<WaterIntake | null>(null);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [pee, setPee] = useState<Pee | null>(null);
  const [poop, setPoop] = useState<Poop | null>(null);
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const rawDateParam = Array.isArray(dateParam) ? dateParam[0] : dateParam;
  const selectedDate = useMemo(() => {
    if (rawDateParam !== undefined && rawDateParam !== '' && isValidLocalDateString(rawDateParam)) {
      return rawDateParam;
    }

    return getTodayDateString();
  }, [rawDateParam]);

  const selectedDateObject = useMemo(() => parseLocalDate(selectedDate), [selectedDate]);
  const isFutureDate = selectedDateObject ? isFutureLocalDate(selectedDateObject) : false;

  const existingCheckIn = useMemo(
    () => checkIns.find((checkIn) => checkIn.date === selectedDate) ?? null,
    [checkIns, selectedDate]
  );

  const formValues = useMemo(
    () => ({
      appetite,
      waterIntake,
      energy,
      mood,
      pee,
      poop,
      notes,
    }),
    [appetite, energy, mood, notes, pee, poop, waterIntake]
  );

  const prefillFromCheckIn = useCallback(
    (checkIn: CheckIn) => {
      setAppetite(checkIn.appetite);
      setWaterIntake(checkIn.waterIntake);
      setEnergy(checkIn.energy);
      setMood(checkIn.mood);
      setPee(checkIn.pee);
      setPoop(checkIn.poop);
      setNotes(checkIn.notes ?? '');
      setValidationError(null);
      clearCheckInError();
    },
    [clearCheckInError]
  );

  const resetForm = useCallback(() => {
    setAppetite(null);
    setWaterIntake(null);
    setEnergy(null);
    setMood(null);
    setPee(null);
    setPoop(null);
    setNotes('');
    setValidationError(null);
    clearCheckInError();
  }, [clearCheckInError]);

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  useEffect(() => {
    if (!pet?.id) {
      return;
    }

    void loadCheckIns(pet.id);
  }, [loadCheckIns, pet?.id]);

  useEffect(() => {
    if (!petIsLoading && !pet) {
      router.dismissTo('/(tabs)/home');
    }
  }, [pet, petIsLoading, router]);

  useEffect(() => {
    if (existingCheckIn) {
      prefillFromCheckIn(existingCheckIn);
      return;
    }

    resetForm();
  }, [existingCheckIn, prefillFromCheckIn, resetForm, selectedDate]);

  const screenTitle = useMemo(() => {
    if (!pet) {
      return '';
    }

    if (isTodayLocalDate(selectedDate)) {
      return t('checkIn.titleToday', { name: pet.name });
    }

    return t('checkIn.titlePast', {
      name: pet.name,
      date: formatCheckInTitleDate(selectedDate),
    });
  }, [pet, selectedDate, t]);

  const trimmedNotes = notes.trim();
  const notesLength = notes.length;
  const isNotesOverLimit = notesLength > CHECK_IN_NOTES_MAX_LENGTH;
  const isFormComplete = isCheckInFormComplete(formValues);
  const completedCount = countCompletedCheckInFields(formValues);
  const isUpdating = existingCheckIn !== null;
  const saveButtonTitle = isUpdating ? t('checkIn.update') : t('checkIn.save');
  const normalizedNotes = trimmedNotes.length > 0 ? trimmedNotes : null;

  const clearErrors = useCallback(() => {
    setValidationError(null);
    clearCheckInError();
  }, [clearCheckInError]);

  const handleSave = useCallback(async () => {
    if (!pet || isFutureDate) {
      return;
    }

    if (!isFormComplete) {
      setValidationError(t('checkIn.validationIncomplete'));
      return;
    }

    if (isNotesOverLimit) {
      setValidationError(
        t('checkIn.validationNotesLength', { max: CHECK_IN_NOTES_MAX_LENGTH })
      );
      return;
    }

    setValidationError(null);
    clearCheckInError();

    const completedValues: CheckInFormValues = formValues;

    try {
      if (existingCheckIn) {
        await updateCheckIn({
          ...existingCheckIn,
          date: selectedDate,
          ...completedValues,
          notes: normalizedNotes,
        });
      } else {
        const checkIn: CheckIn = {
          id: createCheckInId(),
          petId: pet.id,
          date: selectedDate,
          ...completedValues,
          notes: normalizedNotes,
          createdAt: new Date().toISOString(),
        };

        await createCheckIn(checkIn);
      }

      router.replace('/check-in-success');
    } catch {
      // Store already sets error state.
    }
  }, [
    clearCheckInError,
    createCheckIn,
    existingCheckIn,
    formValues,
    isFormComplete,
    isFutureDate,
    isNotesOverLimit,
    normalizedNotes,
    pet,
    router,
    selectedDate,
    t,
    updateCheckIn,
  ]);

  const errorMessage =
    validationError ??
    checkInError ??
    (isFutureDate ? t('checkIn.futureDateError') : null);

  const categoryState = {
    appetite: { value: appetite, onChange: setAppetite },
    waterIntake: { value: waterIntake, onChange: setWaterIntake },
    energy: { value: energy, onChange: setEnergy },
    mood: { value: mood, onChange: setMood },
    pee: { value: pee, onChange: setPee },
    poop: { value: poop, onChange: setPoop },
  } as const;

  const handleCategorySelect = (category: (typeof CHECK_IN_CATEGORIES)[number]['key'], value: string) => {
    clearErrors();
    switch (category) {
      case 'appetite':
        setAppetite(value as Appetite);
        break;
      case 'waterIntake':
        setWaterIntake(value as WaterIntake);
        break;
      case 'energy':
        setEnergy(value as Energy);
        break;
      case 'mood':
        setMood(value as Mood);
        break;
      case 'pee':
        setPee(value as Pee);
        break;
      case 'poop':
        setPoop(value as Poop);
        break;
      default:
        break;
    }
  };

  if (petIsLoading || !pet) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: t('checkIn.title') }} />
        <ScreenContainer edges={['bottom']} contentStyle={styles.centered}>
          <ActivityIndicator color={primaryColor} size="large" />
        </ScreenContainer>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t('checkIn.title') }} />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        <View style={styles.body}>
          <View style={styles.header}>
            <ThemedText type="title">{screenTitle}</ThemedText>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.description}>
              {isUpdating ? t('checkIn.subtitleUpdate') : t('checkIn.subtitle')}
            </ThemedText>
            <CheckInProgress completedCount={completedCount} totalCount={CHECK_IN_CATEGORIES.length} />
          </View>

          {CHECK_IN_CATEGORIES.map((category) => (
            <CheckInCategorySection
              key={category.key}
              emoji={category.emoji}
              category={category.key}
              titleTranslationKey={category.translationKey}
              optionsTranslationKey={category.optionsTranslationKey}
              selected={categoryState[category.key].value}
              onSelect={(value) => handleCategorySelect(category.key, value)}
            />
          ))}

          <CheckInNotesSection
            notes={notes}
            isOverLimit={isNotesOverLimit}
            onChangeNotes={(value) => {
              clearErrors();
              setNotes(value);
            }}
          />
        </View>

        <View style={styles.footer}>
          {errorMessage ? (
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.error}>
              {errorMessage}
            </ThemedText>
          ) : null}

          <Button
            title={saveButtonTitle}
            onPress={() => void handleSave()}
            disabled={!isFormComplete || checkInIsLoading || isFutureDate || isNotesOverLimit}
          />
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  body: {
    flex: 1,
    gap: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  header: {
    gap: Spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    ...Typography.body,
  },
  footer: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  error: {
    textAlign: 'center',
  },
});
