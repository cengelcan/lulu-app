import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { useOnboardingStore } from '@/stores/onboarding.store';

export default function Onboarding4Screen() {
  const router = useRouter();
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

    router.replace('/(setup)/pet-type');
  }, [clearError, completeOnboarding, router]);

  return (
    <OnboardingScreen
      step={4}
      title="Turn daily notes into vet-ready reports."
      description="Prepare users for veterinary visits."
      buttonTitle="Get Started"
      onContinue={() => void handleContinue()}
      isLoading={isLoading}
      error={error}
    />
  );
}
