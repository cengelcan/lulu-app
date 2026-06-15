import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';

export default function Onboarding3Screen() {
  const router = useRouter();

  return (
    <OnboardingScreen
      step={3}
      title="See patterns over time."
      description="Build a simple health history that helps you notice changes early."
      buttonTitle="I'm Ready"
      onContinue={() => router.push('/(onboarding)/intro-4')}
      onBack={() => router.back()}
    />
  );
}
