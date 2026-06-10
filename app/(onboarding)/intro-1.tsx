import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';

export default function Onboarding1Screen() {
  const router = useRouter();

  return (
    <OnboardingScreen
      step={1}
      title="Never forget the small changes."
      description="Keep track of your pet's appetite, energy, and symptoms before they become easy to overlook."
      buttonTitle="Next"
      onContinue={() => router.push('/(onboarding)/intro-2')}
    />
  );
}
