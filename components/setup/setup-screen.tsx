import { StyleSheet, View } from 'react-native';

import { AccentTitle } from '@/components/ui/AccentTitle';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';
import { translateError } from '@/utils/translate-error';

const DEFAULT_TOTAL_STEPS = 6;

type SetupScreenProps = {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  totalSteps?: number;
  title: string;
  titlePrefix?: string;
  titleAccent?: string;
  titleSuffix?: string;
  titleAccentVariant?: 'solid' | 'gradient';
  headerIllustration?: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  buttonTitle?: string;
  onContinue?: () => void;
  onBack?: () => void;
  continueDisabled?: boolean;
  isLoading?: boolean;
  error?: string | null;
  footer?: React.ReactNode;
  buttonPill?: boolean;
};

export function SetupScreen({
  step,
  totalSteps = DEFAULT_TOTAL_STEPS,
  title,
  titlePrefix,
  titleAccent,
  titleSuffix,
  titleAccentVariant = 'solid',
  headerIllustration,
  description,
  children,
  buttonTitle,
  onContinue,
  onBack,
  continueDisabled = false,
  isLoading = false,
  error = null,
  footer,
  buttonPill = false,
}: SetupScreenProps) {
  const { t } = useTranslation();
  const resolvedError = translateError(t, error);
  const resolvedButtonTitle = buttonTitle ?? t('common.continue');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <ScreenContainer scrollable contentStyle={styles.content}>
      <View style={styles.body}>
        {onBack ? <ScreenHeader onBack={onBack} /> : null}
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
                    backgroundColor: isActive || isCompleted ? brandAccentColor : borderColor,
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
          {t('checkIn.progress', { count: step, total: totalSteps })}
        </ThemedText>

        <View style={styles.titleRow}>
          <View style={styles.titleContent}>
            {titleAccent ? (
              <AccentTitle
                prefix={titlePrefix ?? ''}
                accent={titleAccent}
                suffix={titleSuffix}
                accentVariant={titleAccentVariant}
              />
            ) : (
              <ThemedText type="title" style={styles.title}>
                {title}
              </ThemedText>
            )}

            {description ? (
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.description}>
                {description}
              </ThemedText>
            ) : null}
          </View>

          {headerIllustration ? (
            <View style={styles.illustrationSlot}>{headerIllustration}</View>
          ) : null}
        </View>

        <View style={styles.form}>{children}</View>
      </View>

      {resolvedError ? (
        <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor} style={styles.error}>
          {resolvedError}
        </ThemedText>
      ) : null}

      <View style={styles.footerArea}>
        {footer ?? (
          onContinue ? (
            <Button
              title={resolvedButtonTitle}
              onPress={onContinue}
              disabled={continueDisabled || isLoading}
              style={[styles.button, buttonPill && styles.buttonPill]}
            />
          ) : null
        )}
      </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  titleContent: {
    flex: 1,
    gap: Spacing.sm,
    minWidth: 0,
  },
  title: {
    marginTop: 0,
  },
  illustrationSlot: {
    flexShrink: 0,
    paddingTop: Spacing.xxs,
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
  footerArea: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
  },
  button: {
    marginBottom: Spacing.md,
  },
  buttonPill: {
    borderRadius: Radius.pill,
    minHeight: 52,
  },
});
