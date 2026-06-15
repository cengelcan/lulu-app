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
      title="Be prepared for every vet visit."
      description="Bring organized notes and health records when your pet needs care."
      buttonTitle="Start Tracking"
      onContinue={() => void handleContinue()}
      onBack={() => router.back()}
      isLoading={isLoading}
      error={error}
    />
  );
}
