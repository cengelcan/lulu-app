import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';

export default function Onboarding2Screen() {
  const router = useRouter();

  return (
    <OnboardingScreen
      step={2}
      title="Can you remember when the symptoms started?"
      description="The primary goal is to create a health history that helps users remember important changes over time."
      buttonTitle="Continue"
      onContinue={() => router.push('/(onboarding)/intro-3')}
    />
  );
}
