import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingCtaButton } from '@/components/onboarding/onboarding-cta-button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { getOnboardingBackground, getOnboardingImageScale } from '@/constants/onboarding';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { translateError } from '@/utils/translate-error';

const TOTAL_STEPS = 4;

type OnboardingScreenProps = {
  step: 1 | 2 | 3 | 4;
  title: string;
  titleAccent?: string;
  description: string;
  buttonTitle: string;
  onContinue: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  error?: string | null;
};

export function OnboardingScreen({
  step,
  title,
  titleAccent,
  description,
  buttonTitle,
  onContinue,
  onBack,
  isLoading = false,
  error = null,
}: OnboardingScreenProps) {
  const { t } = useTranslation();
  const resolvedError = translateError(t, error);
  const backgroundSource = getOnboardingBackground(step);
  const imageScale = getOnboardingImageScale(step);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            {onBack ? <ScreenHeader backTintColor={Palette.onDark} onBack={onBack} /> : null}

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
                        backgroundColor:
                          isActive || isCompleted ? Palette.brandAccentLight : '#3A3A3A',
                        opacity: isActive ? 1 : isCompleted ? 0.7 : 0.45,
                        width: isActive ? 24 : 8,
                      },
                    ]}
                  />
                );
              })}
            </View>

            <Text
              allowFontScaling
              maxFontSizeMultiplier={2}
              style={styles.stepLabel}>
              {step} of {TOTAL_STEPS}
            </Text>

            <Text
              accessibilityRole="header"
              allowFontScaling
              maxFontSizeMultiplier={1.35}
              style={styles.title}>
              {title}
              {titleAccent ? (
                <>
                  {'\n'}
                  <Text style={styles.titleAccentLine}>{titleAccent}</Text>
                </>
              ) : null}
            </Text>

            <Text allowFontScaling maxFontSizeMultiplier={2} style={styles.description}>
              {description}
            </Text>
          </View>

          <View style={styles.visualArea}>
            <View
              style={[
                styles.imageFrame,
                { width: `${imageScale * 100}%`, height: `${imageScale * 100}%` },
              ]}>
              <Image
                accessibilityIgnoresInvertColors
                source={backgroundSource}
                style={styles.backgroundImage}
                contentFit="cover"
                contentPosition="center"
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          {resolvedError ? <Text allowFontScaling style={styles.error}>{resolvedError}</Text> : null}

          <OnboardingCtaButton title={buttonTitle} onPress={onContinue} disabled={isLoading} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
  header: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.sm,
  },
  progressDot: {
    height: 8,
    borderRadius: Radius.full,
  },
  stepLabel: {
    ...Typography.caption,
    marginTop: Spacing.sm,
    color: Palette.onDarkSoft,
  },
  title: {
    ...Typography.title,
    marginTop: Spacing.xs,
    color: Palette.onDark,
  },
  titleAccentLine: {
    ...Typography.title,
    color: Palette.brandAccentLight,
  },
  description: {
    ...Typography.body,
    marginTop: Spacing.md,
    color: Palette.onDarkSoft,
  },
  visualArea: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -Spacing.lg,
  },
  imageFrame: {
    overflow: 'hidden',
  },
  footer: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.xs,
  },
  error: {
    ...Typography.caption,
    textAlign: 'center',
    color: Palette.onDarkSoft,
  },
});
