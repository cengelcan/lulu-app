import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';

export default function Onboarding3Screen() {
  const router = useRouter();

  return (
    <OnboardingScreen
      step={3}
      title="Daily check-ins take less than 10 seconds."
      description="Allow users to complete a daily health check-in in less than 10 seconds."
      buttonTitle="Continue"
      onContinue={() => router.push('/(onboarding)/intro-4')}
    />
  );
}
