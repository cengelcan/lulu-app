import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { ONBOARDING_STEP_4_BACKGROUND } from '@/constants/onboarding';
import { useTranslation } from '@/hooks/use-translation';
import { useOnboardingStore } from '@/stores/onboarding.store';

export default function Onboarding4Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const isLoading = useOnboardingStore((state) => state.isLoading);
  const error = useOnboardingStore((state) => state.error);
  const clearError = useOnboardingStore((state) => state.clearError);

  const handleContinue = useCallback(async () => {
    clearError();
    await completeOnboarding();

    if (useOnboardingStore.getState().error) {
      return;
    }

    router.replace('/(auth)');
  }, [clearError, completeOnboarding, router]);

  return (
    <OnboardingScreen
      step={4}
      title={t('onboarding.intro4.title')}
      titleAccent={t('onboarding.intro4.titleAccent')}
      description={t('onboarding.intro4.description')}
      buttonTitle={t('onboarding.intro4.button')}
      onContinue={() => void handleContinue()}
      isLoading={isLoading}
      error={error}
      backgroundSource={ONBOARDING_STEP_4_BACKGROUND}
    />
  );
}
