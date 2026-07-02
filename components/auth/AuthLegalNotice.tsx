import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { StyleSheet, Text } from 'react-native';

import { LEGAL_URLS } from '@/constants/legal';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

async function openLegalUrl(url: string): Promise<void> {
  await openBrowserAsync(url, {
    presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
  });
}

export function AuthLegalNotice() {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  return (
    <Text
      allowFontScaling
      accessibilityRole="text"
      style={[styles.notice, { color: textSecondaryColor }]}>
      {t('auth.termsNoticePrefix')}
      <Text
        accessibilityRole="link"
        onPress={() => void openLegalUrl(LEGAL_URLS.terms)}
        style={[styles.link, { color: brandAccentColor }]}>
        {t('profile.terms')}
      </Text>
      {t('auth.termsNoticeMiddle')}
      <Text
        accessibilityRole="link"
        onPress={() => void openLegalUrl(LEGAL_URLS.privacyPolicy)}
        style={[styles.link, { color: brandAccentColor }]}>
        {t('profile.privacyPolicy')}
      </Text>
      {t('auth.termsNoticeSuffix')}
    </Text>
  );
}

const styles = StyleSheet.create({
  notice: {
    ...Typography.caption,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  link: {
    fontWeight: '600',
  },
});
