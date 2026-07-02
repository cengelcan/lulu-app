import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { usePetSetupGuideDismiss } from '@/hooks/use-pet-setup-guide-dismiss';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Pet } from '@/types/pet';
import type { PetRecord } from '@/types/pet-record';
import {
  getPetSetupGuideProgress,
  getPetSetupGuideTasks,
  shouldShowPetSetupGuide,
  type PetSetupGuideTask,
  type PetSetupGuideTaskId,
} from '@/utils/pet-setup-guide';

const CAT_ICON = require('@/assets/images/pet-icon-cat.png');
const DOG_ICON = require('@/assets/images/pet-icon-dog.png');

const GRADIENT_LIGHT = ['#E8F4FC', '#F3F9FE', '#FAFDFF'] as const;
const GRADIENT_DARK = ['#1A2433', '#1A1A1A', '#141414'] as const;

const TASK_LABEL_KEYS: Record<PetSetupGuideTaskId, 'dashboard.setupGuide.tasks.photo' | 'dashboard.setupGuide.tasks.checkIn' | 'dashboard.setupGuide.tasks.weight' | 'dashboard.setupGuide.tasks.record' | 'dashboard.setupGuide.tasks.color'> = {
  photo: 'dashboard.setupGuide.tasks.photo',
  checkIn: 'dashboard.setupGuide.tasks.checkIn',
  weight: 'dashboard.setupGuide.tasks.weight',
  record: 'dashboard.setupGuide.tasks.record',
  color: 'dashboard.setupGuide.tasks.color',
};

type SetupGuideTaskRowProps = {
  label: string;
  isCompleted: boolean;
  onPress: () => void;
};

function SetupGuideTaskRow({ label, isCompleted, onPress }: SetupGuideTaskRowProps) {
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isCompleted }}
      disabled={isCompleted}
      onPress={onPress}
      style={({ pressed }) => [styles.taskRow, { opacity: pressed && !isCompleted ? 0.75 : 1 }]}>
      <View
        style={[
          styles.taskIndicator,
          isCompleted
            ? { backgroundColor: brandAccentColor, borderColor: brandAccentColor }
            : { backgroundColor: 'transparent', borderColor: brandAccentColor },
        ]}>
        {isCompleted ? <IconSymbol name="checkmark" size={10} color={Palette.onDark} /> : null}
      </View>
      <ThemedText
        lightColor={isCompleted ? textSecondaryColor : brandAccentColor}
        darkColor={isCompleted ? textSecondaryColor : brandAccentColor}
        style={[styles.taskLabel, isCompleted && styles.taskLabelCompleted]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

type PetSetupGuideCardProps = {
  pet: Pet;
  hasTodayCheckIn: boolean;
  records: PetRecord[];
};

export function PetSetupGuideCard({ pet, hasTodayCheckIn, records }: PetSetupGuideCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceElevatedColor = useThemeColor({}, 'surfaceElevated');
  const { isDismissed, isLoading, dismiss } = usePetSetupGuideDismiss(pet.id);

  const tasks = useMemo(
    () => getPetSetupGuideTasks({ pet, hasTodayCheckIn, records }),
    [hasTodayCheckIn, pet, records]
  );
  const progress = useMemo(() => getPetSetupGuideProgress(tasks), [tasks]);
  const isVisible = useMemo(
    () => !isLoading && shouldShowPetSetupGuide(tasks, isDismissed, pet.status === 'deceased'),
    [isDismissed, isLoading, pet.status, tasks]
  );

  const handleTaskPress = (task: PetSetupGuideTask) => {
    if (task.isCompleted) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    router.push(task.route);
  };

  const handleDismiss = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    void dismiss();
  };

  if (!isVisible) {
    return null;
  }

  const gradientColors = colorScheme === 'dark' ? GRADIENT_DARK : GRADIENT_LIGHT;
  const petIcon = pet.species === 'dog' ? DOG_ICON : CAT_ICON;

  return (
    <LinearGradient colors={[...gradientColors]} style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          {t('dashboard.setupGuide.title', { name: pet.name })}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.setupGuide.hideA11y')}
          onPress={handleDismiss}
          style={({ pressed }) => [
            styles.hideButton,
            { backgroundColor: surfaceElevatedColor },
            pressed && styles.hideButtonPressed,
          ]}>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={Typography.caption.maxFontSizeMultiplier}
            style={styles.hideButtonLabel}>
            {t('dashboard.setupGuide.hide')}
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.progressTrack,
          { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' },
        ]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: brandAccentColor, width: `${progress}%` },
          ]}
        />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.progressLabel}>
        {t('dashboard.setupGuide.progress', { percent: progress })}
      </ThemedText>

      <View style={styles.contentRow}>
        <View style={styles.taskList}>
          {tasks.map((task) => (
            <SetupGuideTaskRow
              key={task.id}
              label={t(TASK_LABEL_KEYS[task.id])}
              isCompleted={task.isCompleted}
              onPress={() => handleTaskPress(task)}
            />
          ))}
        </View>

        <Image
          accessibilityIgnoresInvertColors
          contentFit="contain"
          source={petIcon}
          style={styles.illustration}
        />
      </View>

      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.hint}>
        {t('dashboard.setupGuide.hint')}
      </ThemedText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  hideButton: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    minHeight: 28,
    justifyContent: 'center',
  },
  hideButtonPressed: {
    opacity: 0.85,
  },
  hideButtonLabel: {
    ...Typography.caption,
    color: Palette.muted,
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressLabel: {
    ...Typography.caption,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  taskList: {
    flex: 1,
    gap: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 28,
  },
  taskIndicator: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskLabel: {
    ...Typography.body,
    flex: 1,
  },
  taskLabelCompleted: {
    textDecorationLine: 'line-through',
  },
  illustration: {
    width: 88,
    height: 88,
  },
  hint: {
    ...Typography.caption,
  },
});
