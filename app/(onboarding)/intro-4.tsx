import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';

export default function Onboarding4Screen() {
  const router = useRouter();

  return (
    <OnboardingScreen
      step={4}
      title="Turn daily notes into vet-ready reports."
      description="Prepare users for veterinary visits."
      buttonTitle="Get Started"
      onContinue={() => router.replace('/(setup)/pet-type')}
    />
  );
}
