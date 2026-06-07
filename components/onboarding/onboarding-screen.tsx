import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const TOTAL_STEPS = 4;

type OnboardingScreenProps = {
  step: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  buttonTitle: string;
  onContinue: () => void;
  isLoading?: boolean;
  error?: string | null;
};

export function OnboardingScreen({
  step,
  title,
  description,
  buttonTitle,
  onContinue,
  isLoading = false,
  error = null,
}: OnboardingScreenProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.body}>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${step} of ${TOTAL_STEPS}`}
          accessibilityValue={{ min: 1, max: TOTAL_STEPS, now: step }}
          style={styles.progress}>
          {Array.from({ length: TOTAL_STEPS }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === step;
            const isCompleted = stepNumber < step;

            return (
              <View
                key={stepNumber}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: isActive || isCompleted ? primaryColor : borderColor,
                    opacity: isActive ? 1 : isCompleted ? 0.7 : 0.35,
                    width: isActive ? 24 : 8,
                  },
                ]}
              />
            );
          })}
        </View>

        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.stepLabel}>
          {step} of {TOTAL_STEPS}
        </ThemedText>

        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>

        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.description}>
          {description}
        </ThemedText>
      </View>

      {error ? (
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      <Button
        title={buttonTitle}
        onPress={onContinue}
        disabled={isLoading}
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.md,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  progressDot: {
    height: 8,
    borderRadius: Radius.full,
  },
  stepLabel: {
    ...Typography.caption,
  },
  title: {
    marginTop: Spacing.sm,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  error: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  button: {
    marginBottom: Spacing.md,
  },
});
