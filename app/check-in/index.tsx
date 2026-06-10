import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import {
  APPETITE_OPTIONS,
  CHECK_IN_NOTES_MAX_LENGTH,
  ENERGY_OPTIONS,
  SYMPTOM_OPTIONS,
} from '@/constants/check-in';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCheckInStore } from '@/stores/check-in.store';
import { usePetStore } from '@/stores/pet.store';
import type { Appetite, CheckIn, Energy, Symptom } from '@/types/check-in';
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

function sortCheckInsByCreatedAtDesc(checkIns: CheckIn[]): CheckIn[] {
  return [...checkIns].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function formatCheckInTime(createdAt: string): string {
  const parsed = new Date(createdAt);

  if (Number.isNaN(parsed.getTime())) {
    return createdAt;
  }

  return parsed.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

type OptionSectionProps<T extends string> = {
  title: string;
  options: { value: T; label: string }[];
  selected: T | null;
  onSelect: (value: T) => void;
};

function OptionSection<T extends string>({
  title,
  options,
  selected,
  onSelect,
}: OptionSectionProps<T>) {
  return (
    <View style={styles.section}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {options.map((option) => (
        <SelectableOption
          key={option.value}
          label={option.label}
          selected={selected === option.value}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </View>
  );
}

type ExistingCheckInItemProps = {
  checkIn: CheckIn;
  isSelected: boolean;
  onSelect: () => void;
};

function ExistingCheckInItem({ checkIn, isSelected, onSelect }: ExistingCheckInItemProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const appetiteLabel =
    APPETITE_OPTIONS.find((option) => option.value === checkIn.appetite)?.label ??
    checkIn.appetite;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onSelect}
      style={[
        styles.existingItem,
        {
          backgroundColor: surfaceColor,
          borderColor: isSelected ? primaryColor : borderColor,
          borderWidth: isSelected ? 2 : StyleSheet.hairlineWidth,
        },
      ]}>
      <ThemedText type="defaultSemiBold">{formatCheckInTime(checkIn.createdAt)}</ThemedText>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.existingItemDetail}>
        {appetiteLabel}
      </ThemedText>
    </Pressable>
  );
}

export default function CheckInScreen() {
  const router = useRouter();
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
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [symptom, setSymptom] = useState<Symptom | null>(null);
  const [notes, setNotes] = useState('');
  const [editingCheckInId, setEditingCheckInId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  const rawDateParam = Array.isArray(dateParam) ? dateParam[0] : dateParam;
  const isExplicitDate = rawDateParam !== undefined && rawDateParam !== '';
  const selectedDate = useMemo(() => {
    if (isExplicitDate && isValidLocalDateString(rawDateParam)) {
      return rawDateParam;
    }

    return getTodayDateString();
  }, [isExplicitDate, rawDateParam]);

  const selectedDateObject = useMemo(() => parseLocalDate(selectedDate), [selectedDate]);
  const isFutureDate = selectedDateObject ? isFutureLocalDate(selectedDateObject) : false;
  const isEditMode = isExplicitDate;

  const dayCheckIns = useMemo(
    () => sortCheckInsByCreatedAtDesc(checkIns.filter((checkIn) => checkIn.date === selectedDate)),
    [checkIns, selectedDate]
  );

  const prefillFromCheckIn = useCallback((checkIn: CheckIn) => {
    setAppetite(checkIn.appetite);
    setEnergy(checkIn.energy);
    setSymptom(checkIn.symptom);
    setNotes(checkIn.notes ?? '');
    setEditingCheckInId(checkIn.id);
    setIsAddingNew(false);
    setValidationError(null);
    clearCheckInError();
  }, [clearCheckInError]);

  const resetForm = useCallback(() => {
    setAppetite(null);
    setEnergy(null);
    setSymptom(null);
    setNotes('');
    setEditingCheckInId(null);
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
      router.replace('/(tabs)/home');
    }
  }, [pet, petIsLoading, router]);

  useEffect(() => {
    setIsAddingNew(false);
  }, [selectedDate]);

  useEffect(() => {
    if (!isEditMode) {
      resetForm();
      return;
    }

    if (dayCheckIns.length === 0) {
      resetForm();
      return;
    }

    if (!isAddingNew) {
      prefillFromCheckIn(dayCheckIns[0]);
    }
  }, [dayCheckIns, isAddingNew, isEditMode, prefillFromCheckIn, resetForm]);

  const screenTitle = useMemo(() => {
    if (!pet) {
      return '';
    }

    if (isTodayLocalDate(selectedDate)) {
      return `How is ${pet.name} today?`;
    }

    return `How was ${pet.name} on ${formatCheckInTitleDate(selectedDate)}?`;
  }, [pet, selectedDate]);

  const trimmedNotes = notes.trim();
  const notesLength = notes.length;
  const isNotesOverLimit = notesLength > CHECK_IN_NOTES_MAX_LENGTH;
  const isFormComplete = appetite !== null && energy !== null && symptom !== null;
  const isEditingExisting = editingCheckInId !== null;
  const saveButtonTitle = isEditingExisting ? 'Update Check-In' : 'Save Check-In';
  const normalizedNotes = trimmedNotes.length > 0 ? trimmedNotes : null;

  const handleSave = useCallback(async () => {
    if (!pet || isFutureDate) {
      return;
    }

    if (!isFormComplete) {
      setValidationError('Please answer all questions before saving.');
      return;
    }

    if (isNotesOverLimit) {
      setValidationError(`Notes must be ${CHECK_IN_NOTES_MAX_LENGTH} characters or fewer.`);
      return;
    }

    setValidationError(null);
    clearCheckInError();

    try {
      if (isEditingExisting && editingCheckInId) {
        const existingCheckIn = dayCheckIns.find((checkIn) => checkIn.id === editingCheckInId);
        if (!existingCheckIn) {
          setValidationError('This check-in could not be found. Please try again.');
          return;
        }

        await updateCheckIn({
          ...existingCheckIn,
          date: selectedDate,
          appetite,
          energy,
          symptom,
          notes: normalizedNotes,
        });
      } else {
        const checkIn: CheckIn = {
          id: createCheckInId(),
          petId: pet.id,
          date: selectedDate,
          appetite,
          energy,
          symptom,
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
    appetite,
    clearCheckInError,
    createCheckIn,
    dayCheckIns,
    editingCheckInId,
    energy,
    isEditingExisting,
    isFormComplete,
    isFutureDate,
    isNotesOverLimit,
    normalizedNotes,
    pet,
    router,
    selectedDate,
    symptom,
    updateCheckIn,
  ]);

  const handleAddAnother = () => {
    resetForm();
    setIsAddingNew(true);
  };

  const errorMessage =
    validationError ??
    checkInError ??
    (isFutureDate ? 'You can only add check-ins for today or past days.' : null);

  if (petIsLoading || !pet) {
    return (
      <ScreenContainer contentStyle={styles.centered}>
        <ActivityIndicator color={primaryColor} size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable contentStyle={styles.content}>
      <View style={styles.body}>
        <ThemedText type="title">{screenTitle}</ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.description}>
          Select one option for each question.
        </ThemedText>

        {isEditMode && dayCheckIns.length > 0 ? (
          <View style={styles.existingSection}>
            <ThemedText type="subtitle">Check-ins for this day</ThemedText>
            <View style={styles.existingList}>
              {dayCheckIns.map((checkIn) => (
                <ExistingCheckInItem
                  key={checkIn.id}
                  checkIn={checkIn}
                  isSelected={editingCheckInId === checkIn.id}
                  onSelect={() => prefillFromCheckIn(checkIn)}
                />
              ))}
            </View>
            {!isAddingNew ? (
              <Button title="Add another check-in" variant="ghost" onPress={handleAddAnother} />
            ) : null}
          </View>
        ) : null}

        <OptionSection
          title="Appetite"
          options={APPETITE_OPTIONS}
          selected={appetite}
          onSelect={(value) => {
            setValidationError(null);
            clearCheckInError();
            setAppetite(value);
          }}
        />

        <OptionSection
          title="Energy"
          options={ENERGY_OPTIONS}
          selected={energy}
          onSelect={(value) => {
            setValidationError(null);
            clearCheckInError();
            setEnergy(value);
          }}
        />

        <OptionSection
          title="Symptoms"
          options={SYMPTOM_OPTIONS}
          selected={symptom}
          onSelect={(value) => {
            setValidationError(null);
            clearCheckInError();
            setSymptom(value);
          }}
        />

        <View style={styles.section}>
          <ThemedText type="subtitle">Anything else you&apos;d like to remember?</ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.notesSubtitle}>
            Optional notes for future vet visits.
          </ThemedText>
          <TextInput
            accessibilityLabel="Additional notes"
            multiline
            placeholder="Example: Limping slightly after the afternoon walk."
            placeholderTextColor={textSecondaryColor}
            style={[
              styles.notesInput,
              {
                color: textColor,
                backgroundColor: surfaceColor,
                borderColor: isNotesOverLimit ? primaryColor : borderColor,
              },
            ]}
            textAlignVertical="top"
            value={notes}
            onChangeText={(value) => {
              setValidationError(null);
              clearCheckInError();
              setNotes(value);
            }}
          />
          <ThemedText
            accessibilityLiveRegion="polite"
            accessibilityLabel={`${notesLength} of ${CHECK_IN_NOTES_MAX_LENGTH} characters`}
            lightColor={isNotesOverLimit ? primaryColor : textSecondaryColor}
            darkColor={isNotesOverLimit ? primaryColor : textSecondaryColor}
            style={styles.notesCounter}>
            {notesLength} / {CHECK_IN_NOTES_MAX_LENGTH}
          </ThemedText>
        </View>
      </View>

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
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  body: {
    flex: 1,
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    ...Typography.body,
  },
  existingSection: {
    gap: Spacing.sm,
  },
  existingList: {
    gap: Spacing.sm,
  },
  existingItem: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  existingItemDetail: {
    ...Typography.caption,
  },
  section: {
    gap: Spacing.sm,
  },
  notesSubtitle: {
    ...Typography.body,
  },
  notesInput: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 120,
  },
  notesCounter: {
    ...Typography.caption,
    textAlign: 'right',
  },
  error: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  button: {
    marginBottom: Spacing.md,
  },
});
