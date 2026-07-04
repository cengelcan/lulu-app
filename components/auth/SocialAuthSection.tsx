import Ionicons from '@expo/vector-icons/Ionicons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';

type SocialAuthSectionProps = {
  onApplePress?: () => void | Promise<void>;
  appleLoading?: boolean;
  disabled?: boolean;
};

export function useAppleSignInAvailable(): boolean {
  const [isAvailable, setIsAvailable] = useState(Platform.OS === 'ios');

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      setIsAvailable(false);
      return;
    }

    void AppleAuthentication.isAvailableAsync().then(setIsAvailable);
  }, []);

  return isAvailable;
}

export function SocialAuthSection({
  onApplePress,
  appleLoading = false,
  disabled = false,
}: SocialAuthSectionProps) {
  const { t } = useTranslation();
  const isAppleAvailable = useAppleSignInAvailable();

  if (!isAppleAvailable) {
    return null;
  }

  const isAppleDisabled = disabled || appleLoading || !onApplePress;

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('auth.continueWithApple')}
        accessibilityState={{ disabled: isAppleDisabled, busy: appleLoading }}
        disabled={isAppleDisabled}
        onPress={() => void onApplePress?.()}
        style={({ pressed }) => [
          styles.socialButton,
          { opacity: pressed && !isAppleDisabled ? 0.85 : 1 },
        ]}>
        {appleLoading ? (
          <ActivityIndicator color={Palette.ink} />
        ) : (
          <Ionicons name="logo-apple" size={22} color={Palette.ink} />
        )}
        <Text allowFontScaling style={styles.socialLabel}>
          {t('auth.continueWithApple')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Palette.canvas,
  },
  socialLabel: {
    ...Typography.bodySemiBold,
    color: Palette.ink,
  },
});
