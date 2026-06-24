import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { ONBOARDING_STEP_1_BACKGROUND } from '@/constants/onboarding';
import { useTranslation } from '@/hooks/use-translation';

export default function Onboarding1Screen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <OnboardingScreen
      step={1}
      title={t('onboarding.intro1.title')}
      titleAccent={t('onboarding.intro1.titleAccent')}
      description={t('onboarding.intro1.description')}
      buttonTitle={t('onboarding.intro1.button')}
      onContinue={() => router.push('/(onboarding)/intro-2')}
      backgroundSource={ONBOARDING_STEP_1_BACKGROUND}
    />
  );
}
