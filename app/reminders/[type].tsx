import { HeaderBackButton } from "expo-router/react-navigation";
import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { RecordNotesField } from '@/components/records/RecordNotesField';
import { ReminderRecurrenceField } from '@/components/reminders/ReminderRecurrenceField';
import { ReminderTypeFields } from '@/components/reminders/ReminderTypeFields';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { PlusLockButtonIcon } from '@/components/ui/PlusLockIcon';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TimePickerField } from '@/components/ui/TimePickerField';
import { REMINDER_TYPES } from '@/constants/reminder-types';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { Spacing, Typography } from '@/constants/theme';
import { usePlusFeature } from '@/hooks/use-plus-feature';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import * as petReminderStorage from '@/storage/pet-reminder.storage';
import { usePetReminderStore } from '@/stores/pet-reminder.store';
import { usePetStore } from '@/stores/pet.store';
import { useUserStore } from '@/stores/user.store';
import {
  createDefaultReminderMetadata,
  DEFAULT_REMINDER_RECURRENCE,
  PET_REMINDER_NOTES_MAX_LENGTH,
  type PetReminder,
  type ReminderMetadataByType,
  type ReminderTypeId,
} from '@/types/pet-reminder';
import { DEFAULT_REMINDER_TIME } from '@/types/reminder';
import { formatLocalDate, getTodayStart } from '@/utils/date';
import { addDays } from '@/services/notifications/date';
import { getReminderTypeLabelKey } from '@/utils/pet-reminder-display';
import { isReminderOverdue } from '@/utils/reminder-overdue';
import { resolveReminderTypeId } from '@/utils/pet-reminder-normalize';
import { validatePetReminderForm } from '@/utils/pet-reminder-validation';
import { canUsePlusFeature } from '@/utils/subscription-limits';
import { canWritePetCareData } from '@/utils/pet-access';

function createReminderId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function ReminderFormScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { type: typeParam, id: idParam } = useLocalSearchParams<{ type?: string; id?: string | string[] }>();

  const rawType = Array.isArray(typeParam) ? typeParam[0] : typeParam;
  const reminderType = rawType ? resolveReminderTypeId(rawType) : null;
  const reminderId = Array.isArray(idParam) ? idParam[0] : idParam;

  const pet = usePetStore((state) => state.pet);
  const pets = usePetStore((state) => state.pets);
  const createReminder = usePetReminderStore((state) => state.createReminder);
  const updateReminder = usePetReminderStore((state) => state.updateReminder);
  const completeReminder = usePetReminderStore((state) => state.completeReminder);
  const skipReminder = usePetReminderStore((state) => state.skipReminder);
  const snoozeReminder = usePetReminderStore((state) => state.snoozeReminder);
  const deleteReminder = usePetReminderStore((state) => state.deleteReminder);
  const { allowed: canCreateReminder, requestAccess } =
    usePlusFeature('unlimitedReminders');
  const isPlusActive = useUserStore((state) => state.isPlusActive);

  const [dueDate, setDueDate] = useState(() => formatLocalDate(getTodayStart()));
  const [dueTime, setDueTime] = useState({ ...DEFAULT_REMINDER_TIME });
  const [recurrence, setRecurrence] = useState({ ...DEFAULT_REMINDER_RECURRENCE });
  const [metadata, setMetadata] = useState<ReminderMetadataByType[ReminderTypeId]>(() =>
    reminderType ? createDefaultReminderMetadata(reminderType) : createDefaultReminderMetadata('custom')
  );
  const [notes, setNotes] = useState('');
  const [existingReminder, setExistingReminder] = useState<PetReminder | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(Boolean(reminderId));
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [isSnoozing, setIsSnoozing] = useState(false);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const leaveForm = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/reminders' as Href);
  }, [router]);

  const headerLeft = useCallback(
    () => (
      <HeaderBackButton
        displayMode="minimal"
        tintColor={primaryColor}
        onPress={leaveForm}
      />
    ),
    [leaveForm, primaryColor]
  );

  const isEditMode = Boolean(reminderId);
  const isReadOnly = pet ? !canWritePetCareData(pet) : false;
  const isCompleted = existingReminder?.status === 'completed';
  const isSkipped = existingReminder?.status === 'skipped';
  const isOverdue = useMemo(() => {
    if (!existingReminder || existingReminder.status !== 'pending') {
      return false;
    }

    return isReminderOverdue(existingReminder);
  }, [existingReminder]);
  const notesOverLimit = notes.length > PET_REMINDER_NOTES_MAX_LENGTH;

  const screenTitle = useMemo(() => {
    if (!reminderType) {
      return t('reminders.title');
    }

    return t(getReminderTypeLabelKey(reminderType));
  }, [reminderType, t]);

  useEffect(() => {
    if (!reminderType) {
      router.replace('/reminders' as Href);
    }
  }, [reminderType, router]);

  useEffect(() => {
    if (!reminderType) {
      return;
    }

    setMetadata(createDefaultReminderMetadata(reminderType));
    setValidationError(null);
  }, [reminderType]);

  useEffect(() => {
    if (!reminderId || !reminderType) {
      setIsHydrating(false);
      return;
    }

    let cancelled = false;

    async function hydrateExistingReminder() {
      if (!reminderId) {
        return;
      }

      setIsHydrating(true);

      try {
        const reminder = await petReminderStorage.getPetReminderById(reminderId);

        if (cancelled) {
          return;
        }

        if (!reminder || reminder.type !== reminderType) {
          router.replace('/reminders' as Href);
          return;
        }

        setExistingReminder(reminder);
        setDueDate(reminder.dueDate);
        setDueTime(reminder.dueTime);
        setRecurrence(reminder.recurrence);
        setMetadata(reminder.metadata);
        setNotes(reminder.notes ?? '');
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
        }
      }
    }

    void hydrateExistingReminder();

    return () => {
      cancelled = true;
    };
  }, [reminderId, reminderType, router]);

  const handleSave = useCallback(async () => {
    if (!reminderType || !pet?.id || isReadOnly || isCompleted) {
      return;
    }

    const validationKey = validatePetReminderForm(
      reminderType,
      dueDate,
      metadata,
      notes.length,
      PET_REMINDER_NOTES_MAX_LENGTH
    );

    if (validationKey) {
      setValidationError(t(validationKey));
      return;
    }

    if (!isEditMode) {
      const allowed = await canUsePlusFeature('unlimitedReminders', isPlusActive, pets);
      if (!allowed) {
        requestAccess();
        return;
      }
    }

    setValidationError(null);
    setIsSaving(true);

    const now = new Date().toISOString();
    const trimmedNotes = normalizeOptionalText(notes);

    try {
      if (isEditMode && existingReminder) {
        const updatedReminder = {
          ...existingReminder,
          dueDate,
          dueTime,
          recurrence,
          notes: trimmedNotes,
          metadata,
          updatedAt: now,
        } as PetReminder;

        await updateReminder(updatedReminder);
      } else {
        const newReminder = {
          id: createReminderId(),
          petId: pet.id,
          type: reminderType,
          dueDate,
          dueTime,
          recurrence,
          notes: trimmedNotes,
          metadata,
          status: 'pending',
          completedAt: null,
          recordId: null,
          createdAt: now,
          updatedAt: now,
        } as PetReminder;

        await createReminder(newReminder);
      }

      leaveForm();
    } catch {
      setValidationError(t('reminders.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  }, [
    createReminder,
    dueDate,
    dueTime,
    existingReminder,
    isCompleted,
    isEditMode,
    isPlusActive,
    isReadOnly,
    leaveForm,
    metadata,
    notes,
    pet?.id,
    pets,
    recurrence,
    reminderType,
    requestAccess,
    t,
    updateReminder,
  ]);

  const handleComplete = useCallback(async () => {
    if (!reminderId || !pet?.id || isReadOnly || isCompleted) {
      return;
    }

    setIsCompleting(true);

    try {
      await completeReminder(reminderId, pet.id);
      leaveForm();
    } catch {
      setValidationError(t('reminders.completeFailed'));
    } finally {
      setIsCompleting(false);
    }
  }, [completeReminder, isCompleted, isReadOnly, leaveForm, pet?.id, reminderId, t]);

  const handleSkip = useCallback(() => {
    if (!reminderId || !pet?.id || isReadOnly || isCompleted || isSkipped) {
      return;
    }

    Alert.alert(t('reminders.skipTitle'), t('reminders.skipMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('reminders.skipReminder'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setIsSkipping(true);

            try {
              await skipReminder(reminderId, pet.id);
              leaveForm();
            } catch {
              setValidationError(t('reminders.skipFailed'));
            } finally {
              setIsSkipping(false);
            }
          })();
        },
      },
    ]);
  }, [isCompleted, isReadOnly, isSkipped, leaveForm, pet?.id, reminderId, skipReminder, t]);

  const handleSnooze = useCallback(async () => {
    if (!reminderId || !pet?.id || isReadOnly || isCompleted || isSkipped) {
      return;
    }

    const nextDueDate = formatLocalDate(addDays(getTodayStart(), 1));

    setIsSnoozing(true);

    try {
      await snoozeReminder(reminderId, pet.id, nextDueDate, dueTime);
      leaveForm();
    } catch {
      setValidationError(t('reminders.snoozeFailed'));
    } finally {
      setIsSnoozing(false);
    }
  }, [
    dueTime,
    isCompleted,
    isReadOnly,
    isSkipped,
    leaveForm,
    pet?.id,
    reminderId,
    snoozeReminder,
    t,
  ]);

  const handleDelete = useCallback(() => {
    if (!reminderId || !pet?.id || isReadOnly) {
      return;
    }

    Alert.alert(t('reminders.deleteTitle'), t('reminders.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteReminder(reminderId, pet.id);
              leaveForm();
            } catch {
              setValidationError(t('reminders.deleteFailed'));
            }
          })();
        },
      },
    ]);
  }, [deleteReminder, isReadOnly, leaveForm, pet?.id, reminderId, t]);

  if (!reminderType) {
    return null;
  }

  const typeDefinition = REMINDER_TYPES.find((item) => item.id === reminderType);

  return (
    <>
      <Stack.Screen
        options={{
          ...STACK_BACK_ONLY_OPTIONS,
          headerShown: true,
          title: screenTitle,
          headerBackVisible: false,
          headerLeft,
        }}
      />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        {isHydrating ? (
          <View style={styles.centered}>
            <ActivityIndicator color={primaryColor} size="large" />
          </View>
        ) : (
          <>
            {typeDefinition ? (
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.intro}>
                {isCompleted
                  ? t('reminders.completedReadOnly')
                  : isSkipped
                    ? t('reminders.skippedReadOnly')
                    : isEditMode
                      ? isOverdue
                        ? t('reminders.overdueReminder')
                        : t('reminders.editReminder')
                      : t('reminders.addReminderType', { type: t(typeDefinition.labelKey) })}
              </ThemedText>
            ) : null}

            <GroupedSection title={t('reminders.sections.details')}>
              <View style={styles.sectionBody}>
                <View style={styles.field}>
                  <ThemedText type="defaultSemiBold">{t('reminders.fields.dueDate')}</ThemedText>
                  <DatePickerField
                    accessibilityLabel={t('reminders.fields.dueDate')}
                    disabled={isCompleted || isSkipped}
                    maximumDate={null}
                    minimumDate={getTodayStart()}
                    placeholder={t('reminders.fields.dueDatePlaceholder')}
                    value={dueDate}
                    onChange={(value) => {
                      setValidationError(null);
                      setDueDate(value);
                    }}
                  />
                </View>

                <TimePickerField
                  accessibilityLabel={t('reminders.fields.dueTime')}
                  disabled={isCompleted || isSkipped}
                  label={t('reminders.fields.dueTime')}
                  value={dueTime}
                  variant="row"
                  onChange={(value) => {
                    setValidationError(null);
                    setDueTime(value);
                  }}
                />

                <ReminderTypeFields
                  metadata={metadata}
                  type={reminderType}
                  onChangeMetadata={(nextMetadata) => {
                    setValidationError(null);
                    setMetadata(nextMetadata);
                  }}
                />

                {!isCompleted ? (
                  <ReminderRecurrenceField
                    value={recurrence}
                    onChange={(value) => {
                      setValidationError(null);
                      setRecurrence(value);
                    }}
                  />
                ) : null}
              </View>
            </GroupedSection>

            <GroupedSection title={t('reminders.sections.notes')}>
              <View style={styles.sectionBody}>
                <RecordNotesField
                  isOverLimit={notesOverLimit}
                  value={notes}
                  onChangeText={(value) => {
                    setValidationError(null);
                    setNotes(value);
                  }}
                />
              </View>
            </GroupedSection>

            {validationError ? (
              <ThemedText lightColor={primaryColor} darkColor={primaryColor} style={styles.error}>
                {validationError}
              </ThemedText>
            ) : null}

            {isReadOnly ? (
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.intro}>
                {t('reminders.deceasedReadOnly')}
              </ThemedText>
            ) : isCompleted || isSkipped ? null : (
              <View style={styles.actions}>
                <Button
                  title={isEditMode ? t('reminders.saveChanges') : t('reminders.saveReminder')}
                  disabled={isSaving || notesOverLimit}
                  trailingIcon={
                    !isEditMode && !canCreateReminder ? <PlusLockButtonIcon /> : undefined
                  }
                  onPress={() => void handleSave()}
                />
                {isEditMode ? (
                  <>
                    <Button
                      title={t('reminders.markComplete')}
                      disabled={isCompleting}
                      variant="secondary"
                      onPress={() => void handleComplete()}
                    />
                    {isOverdue ? (
                      <>
                        <Button
                          title={t('reminders.snoozeReminder')}
                          disabled={isSnoozing}
                          variant="secondary"
                          onPress={() => void handleSnooze()}
                        />
                        <Button
                          title={t('reminders.skipReminder')}
                          disabled={isSkipping}
                          variant="secondary"
                          onPress={handleSkip}
                        />
                      </>
                    ) : null}
                    <Button
                      title={t('reminders.deleteReminder')}
                      variant="destructive"
                      onPress={handleDelete}
                    />
                  </>
                ) : null}
              </View>
            )}
          </>
        )}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  intro: {
    ...Typography.body,
    paddingHorizontal: Spacing.xs,
  },
  sectionBody: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  field: {
    gap: Spacing.xs,
  },
  error: {
    ...Typography.body,
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.sm,
  },
});
