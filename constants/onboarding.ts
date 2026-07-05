import type { ImageSourcePropType } from 'react-native';

/** Set to true to show the 4 intro screens after welcome. */
export const ONBOARDING_INTRO_SCREENS_ENABLED = false;

export const ONBOARDING_BACKGROUNDS = {
  1: require('@/assets/images/onboarding/ob-bg-1.png'),
  2: require('@/assets/images/onboarding/ob-bg-2.png'),
  3: require('@/assets/images/onboarding/ob-bg-3.png'),
  4: require('@/assets/images/onboarding/ob-bg-4.png'),
} as const satisfies Record<1 | 2 | 3 | 4, ImageSourcePropType>;

export const ONBOARDING_IMAGE_SCALE_BY_STEP = {
  1: 0.9,
  2: 0.9,
  3: 0.9,
  4: 0.9,
} as const satisfies Record<1 | 2 | 3 | 4, number>;

export function getOnboardingBackground(step: 1 | 2 | 3 | 4): ImageSourcePropType {
  return ONBOARDING_BACKGROUNDS[step];
}

export function getOnboardingImageScale(step: 1 | 2 | 3 | 4): number {
  return ONBOARDING_IMAGE_SCALE_BY_STEP[step];
}
