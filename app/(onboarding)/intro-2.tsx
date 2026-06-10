import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';

export default function Onboarding2Screen() {
  const router = useRouter();

  return (
    <OnboardingScreen
      step={2}
      title="Check in within seconds."
      description="Record how your pet is doing in under 10 seconds — anytime, anywhere."
      buttonTitle="Sounds Good"
      onContinue={() => router.push('/(onboarding)/intro-3')}
    />
  );
}
