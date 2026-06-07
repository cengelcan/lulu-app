import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';

export default function Onboarding1Screen() {
  const router = useRouter();

  return (
    <OnboardingScreen
      step={1}
      title="Never forget an important health change again."
      description="The application focuses on symptom awareness, behavioral changes and veterinary visit preparation."
      buttonTitle="Continue"
      onContinue={() => router.push('/(onboarding)/intro-2')}
    />
  );
}
