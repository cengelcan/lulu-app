import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckInDatePicker, CheckInHeader } from '@/components/check-in/CheckInHeader';
import { CheckInNotesSection } from '@/components/check-in/CheckInNotesSection';
import { CheckInProgressCard } from '@/components/check-in/CheckInProgressCard';
import { DailyEssentialsCard } from '@/components/check-in/DailyEssentialsCard';
import { ThemedText } from '@/components/themed-text';
import { BrandGradientFill } from '@/components/ui/BrandGradient';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { CHECK_IN_CATEGORIES, CHECK_IN_NOTES_MAX_LENGTH } from '@/constants/check-in';
import { CheckInTheme } from '@/constants/check-in-theme';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { Radius, Spacing, Typography, Palette } from '@/constants/theme';
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
  const insets = useSafeAreaInsets();
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
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const primaryColor = useThemeColor({}, 'primary');
  const primaryTextColor = useThemeColor({}, 'primaryText');
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
  const isReadOnly = pet?.status === 'deceased';

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

  const handleDateChange = useCallback(
    (date: string) => {
      if (!date || date === selectedDate) {
        return;
      }

      router.setParams({ date });
    },
    [router, selectedDate]
  );

  const handleSave = useCallback(async () => {
    if (!pet || isFutureDate || isReadOnly) {
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
    isReadOnly,
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
    (isReadOnly ? t('checkIn.deceasedReadOnly') : null) ??
    (isFutureDate ? t('checkIn.futureDateError') : null);

  const handleCategorySelect = (category: (typeof CHECK_IN_CATEGORIES)[number]['key'], value: string) => {
    if (isReadOnly) {
      return;
    }

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

  const headerRight = useCallback(
    () => (
      <HeaderIconButton
        accessibilityLabel={t('checkIn.title')}
        borderColor={CheckInTheme.headerButtonBorder}
        onPress={() => setDatePickerVisible(true)}>
        <IconSymbol name="calendar.badge.checkmark" size={18} color="#FFFFFF" />
      </HeaderIconButton>
    ),
    [t]
  );

  const checkInHeaderOptions = useMemo(
    () => ({
      ...STACK_BACK_ONLY_OPTIONS,
      headerShown: true as const,
      title: t('checkIn.title'),
      headerStyle: { backgroundColor: CheckInTheme.background },
      headerShadowVisible: false,
      headerTintColor: '#FFFFFF',
      headerBackVisible: false,
      headerLeft: () => (
        <HeaderIconButton
          accessibilityLabel={t('common.back')}
          borderColor={CheckInTheme.headerButtonBorder}
          onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={18} color="#FFFFFF" />
        </HeaderIconButton>
      ),
      headerRight,
      headerLeftContainerStyle: { paddingLeft: Spacing.md },
      headerRightContainerStyle: { paddingRight: Spacing.md },
    }),
    [headerRight, router, t]
  );

  if (petIsLoading || !pet) {
    return (
      <>
        <Stack.Screen
          options={{
            ...checkInHeaderOptions,
          }}
        />
        <ScreenContainer
          edges={['bottom']}
          contentStyle={styles.centered}
          style={{ backgroundColor: CheckInTheme.background }}>
          <ActivityIndicator color={primaryColor} size="large" />
        </ScreenContainer>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={checkInHeaderOptions} />
      <ScreenContainer
        scrollable
        edges={['bottom']}
        contentStyle={styles.content}
        style={{ backgroundColor: CheckInTheme.background }}>
        <View style={[styles.body, { paddingBottom: insets.bottom + 88 }]}>
          <CheckInHeader
            petName={pet.name}
            petPhotoUri={pet.photoUri}
            screenTitle={screenTitle}
            selectedDate={selectedDate}
            onOpenDatePicker={() => setDatePickerVisible(true)}
          />

          <CheckInProgressCard
            formValues={formValues}
            completedCount={completedCount}
            totalCount={CHECK_IN_CATEGORIES.length}
          />

          <DailyEssentialsCard
            formValues={formValues}
            onCategoryChange={handleCategorySelect}
            disabled={isReadOnly}
          />

          <CheckInNotesSection
            notes={notes}
            isOverLimit={isNotesOverLimit}
            onChangeNotes={(value) => {
              if (isReadOnly) {
                return;
              }
              clearErrors();
              setNotes(value);
            }}
          />

          {errorMessage ? (
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.error}>
              {errorMessage}
            </ThemedText>
          ) : null}
        </View>
      </ScreenContainer>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, Spacing.md),
            backgroundColor: CheckInTheme.background,
          },
        ]}>
        <Pressable
          accessibilityRole="button"
          disabled={!isFormComplete || checkInIsLoading || isFutureDate || isNotesOverLimit || isReadOnly}
          onPress={() => void handleSave()}
          style={({ pressed }) => [
            styles.saveButton,
            {
              opacity:
                !isFormComplete || checkInIsLoading || isFutureDate || isNotesOverLimit || isReadOnly
                  ? 0.45
                  : pressed
                    ? 0.85
                    : 1,
            },
          ]}>
          <BrandGradientFill />
          <View style={styles.saveIconCircle}>
            <IconSymbol name="checkmark" size={16} color={Palette.brandGradientEnd} />
          </View>
          <ThemedText
            lightColor={primaryTextColor}
            darkColor={primaryTextColor}
            style={styles.saveLabel}>
            {saveButtonTitle}
          </ThemedText>
        </Pressable>
      </View>

      <CheckInDatePicker
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        disabled={isReadOnly}
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  body: {
    gap: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  saveButton: {
    minHeight: 52,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  saveIconCircle: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    ...Typography.button,
    color: '#FFFFFF',
  },
});
