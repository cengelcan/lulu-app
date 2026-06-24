import type { ImageSourcePropType } from 'react-native';

export const ONBOARDING_BACKGROUNDS = {
  dark: {
    1: require('@/assets/images/onboarding/ob-bg-1.png'),
    2: require('@/assets/images/onboarding/ob-bg-2.png'),
    3: require('@/assets/images/onboarding/ob-bg-3.png'),
    4: require('@/assets/images/onboarding/ob-bg-4.png'),
  },
  light: {
    1: require('@/assets/images/onboarding/ob-bg-1-l.png'),
    2: require('@/assets/images/onboarding/ob-bg-2-l.png'),
    3: require('@/assets/images/onboarding/ob-bg-3-l.png'),
    4: require('@/assets/images/onboarding/ob-bg-4-l.png'),
  },
} as const satisfies Record<'dark' | 'light', Record<1 | 2 | 3 | 4, ImageSourcePropType>>;

export const ONBOARDING_IMAGE_SCALE_BY_STEP = {
  dark: {
    1: 0.9,
    2: 0.9,
    3: 0.9,
    4: 0.9,
  },
  light: {
    1: 0.86,
    2: 0.86,
    3: 0.86,
    4: 0.86,
  },
} as const satisfies Record<'dark' | 'light', Record<1 | 2 | 3 | 4, number>>;

export function getOnboardingBackground(
  step: 1 | 2 | 3 | 4,
  colorScheme: 'light' | 'dark' | null | undefined,
): ImageSourcePropType {
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  return ONBOARDING_BACKGROUNDS[theme][step];
}

export function getOnboardingImageScale(
  step: 1 | 2 | 3 | 4,
  colorScheme: 'light' | 'dark' | null | undefined,
): number {
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  return ONBOARDING_IMAGE_SCALE_BY_STEP[theme][step];
}
