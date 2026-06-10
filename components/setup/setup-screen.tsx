import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const DEFAULT_TOTAL_STEPS = 6;

type SetupScreenProps = {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  totalSteps?: number;
  title: string;
  description?: string;
  children?: React.ReactNode;
  buttonTitle?: string;
  onContinue?: () => void;
  continueDisabled?: boolean;
  isLoading?: boolean;
  error?: string | null;
  footer?: React.ReactNode;
};

export function SetupScreen({
  step,
  totalSteps = DEFAULT_TOTAL_STEPS,
  title,
  description,
  children,
  buttonTitle = 'Continue',
  onContinue,
  continueDisabled = false,
  isLoading = false,
  error = null,
  footer,
}: SetupScreenProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <ScreenContainer scrollable contentStyle={styles.content}>
      <View style={styles.body}>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${step} of ${totalSteps}`}
          accessibilityValue={{ min: 1, max: totalSteps, now: step }}
          style={styles.progress}>
          {Array.from({ length: totalSteps }, (_, index) => {
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
          {step} of {totalSteps}
        </ThemedText>

        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>

        {description ? (
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.description}>
            {description}
          </ThemedText>
        ) : null}

        <View style={styles.form}>{children}</View>
      </View>

      {error ? (
        <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor} style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      {footer ?? (
        onContinue ? (
          <Button
            title={buttonTitle}
            onPress={onContinue}
            disabled={continueDisabled || isLoading}
            style={styles.button}
          />
        ) : null
      )}
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
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressDot: {
    height: 8,
    borderRadius: Radius.full,
  },
  stepLabel: {
    ...Typography.caption,
  },
  title: {
    marginTop: Spacing.xs,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    marginTop: Spacing.sm,
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
