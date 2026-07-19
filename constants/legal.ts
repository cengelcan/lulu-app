import type { ResolvedLanguage } from '@/types/language';

const LEGAL_SITE_URL = 'https://lulu.pet';

export function getLegalUrls(language: ResolvedLanguage) {
  return {
    privacyPolicy: `${LEGAL_SITE_URL}/${language}/privacy-policy/`,
    terms: `${LEGAL_SITE_URL}/${language}/terms/`,
  } as const;
}

export const LEGAL_URLS = {
  support: `${LEGAL_SITE_URL}/support`,
};

export const SUPPORT_EMAIL = 'support@lulu.pet';
