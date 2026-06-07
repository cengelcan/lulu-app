import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { APPETITE_OPTIONS, ENERGY_OPTIONS, SYMPTOM_OPTIONS } from '@/constants/check-in';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCheckInStore } from '@/stores/check-in.store';
import { usePetStore } from '@/stores/pet.store';
import type { Appetite, CheckIn, Energy, Symptom } from '@/types/check-in';

function createCheckInId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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

export default function CheckInScreen() {
  const router = useRouter();

  const pet = usePetStore((state) => state.pet);
  const petIsLoading = usePetStore((state) => state.isLoading);
  const loadPet = usePetStore((state) => state.loadPet);

  const createCheckIn = useCheckInStore((state) => state.createCheckIn);
  const checkInIsLoading = useCheckInStore((state) => state.isLoading);
  const checkInError = useCheckInStore((state) => state.error);
  const clearCheckInError = useCheckInStore((state) => state.clearError);

  const [appetite, setAppetite] = useState<Appetite | null>(null);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [symptom, setSymptom] = useState<Symptom | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  useEffect(() => {
    if (!petIsLoading && !pet) {
      router.replace('/(main)/dashboard');
    }
  }, [pet, petIsLoading, router]);

  const isFormComplete = appetite !== null && energy !== null && symptom !== null;

  const handleSave = useCallback(async () => {
    if (!pet) {
      return;
    }

    if (!isFormComplete) {
      setValidationError('Please answer all questions before saving.');
      return;
    }

    setValidationError(null);
    clearCheckInError();

    const checkIn: CheckIn = {
      id: createCheckInId(),
      petId: pet.id,
      date: getTodayDateString(),
      appetite,
      energy,
      symptom,
      createdAt: new Date().toISOString(),
    };

    try {
      await createCheckIn(checkIn);
      router.replace('/check-in-success');
    } catch {
      // Store already sets error state.
    }
  }, [
    appetite,
    clearCheckInError,
    createCheckIn,
    energy,
    isFormComplete,
    pet,
    router,
    symptom,
  ]);

  const errorMessage = validationError ?? checkInError;

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
        <ThemedText type="title">How is {pet.name} today?</ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.description}>
          Select one option for each question.
        </ThemedText>

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
        title="Save Check-In"
        onPress={() => void handleSave()}
        disabled={!isFormComplete || checkInIsLoading}
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
  section: {
    gap: Spacing.sm,
  },
  error: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  button: {
    marginBottom: Spacing.md,
  },
});
