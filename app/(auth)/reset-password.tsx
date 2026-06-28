import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoLinking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthInput } from '@/components/auth/AuthInput';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import {
  AuthError,
  type AuthErrorCode,
  ensureRecoverySession,
  signOutUser,
  updatePassword,
} from '@/services/auth';

const PASSWORD_MIN_LENGTH = 6;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const linkingUrl = ExpoLinking.useLinkingURL();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const alertColor = useThemeColor({}, 'alert');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  useEffect(() => {
    let isMounted = true;

    void ensureRecoverySession(linkingUrl)
      .catch(() => null)
      .finally(() => {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [linkingUrl]);

  const handleSubmit = useCallback(async () => {
    if (!password) {
      setErrorKey('auth.errors.passwordRequired');
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setErrorKey('auth.errors.passwordTooShort');
      return;
    }

    if (!confirmPassword) {
      setErrorKey('auth.errors.confirmPasswordRequired');
      return;
    }

    if (password !== confirmPassword) {
      setErrorKey('auth.errors.passwordMismatch');
      return;
    }

    setErrorKey(null);
    setIsSubmitting(true);

    try {
      const session = await ensureRecoverySession(linkingUrl);

      if (!session) {
        setErrorKey('auth.resetPasswordInvalidLink');
        return;
      }

      await updatePassword(password);
      await signOutUser('local');
      setIsSuccess(true);
    } catch (error) {
      const code: AuthErrorCode = error instanceof AuthError ? error.code : 'unknown';
      setErrorKey(`auth.errors.${code}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmPassword, linkingUrl, password]);

  const handleGoToSignIn = useCallback(() => {
    router.replace('/(auth)');
  }, [router]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0a0a12', '#101010', '#14101c']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <ThemedText accessibilityRole="header" type="title">
                {isSuccess ? t('auth.resetPasswordSuccessTitle') : t('auth.resetPasswordScreenTitle')}
              </ThemedText>
              <IconSymbol
                name={isSuccess ? 'checkmark.circle' : 'lock.fill'}
                size={24}
                color={brandAccentColor}
              />
            </View>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.subtitle}>
              {isSuccess
                ? t('auth.resetPasswordSuccessMessage')
                : t('auth.resetPasswordScreenSubtitle')}
            </ThemedText>
          </View>

          {isSuccess ? (
            <Button
              title={t('auth.signInButton')}
              accessibilityLabel={t('auth.signInButton')}
              onPress={handleGoToSignIn}
              style={styles.submit}
            />
          ) : (
            <View style={styles.form}>
              <AuthInput
                accessibilityLabel={t('auth.newPasswordPlaceholder')}
                autoCapitalize="none"
                autoComplete="new-password"
                autoCorrect={false}
                icon="lock.fill"
                placeholder={t('auth.newPasswordPlaceholder')}
                returnKeyType="next"
                secureTextEntry
                value={password}
                onChangeText={(value) => {
                  setErrorKey(null);
                  setPassword(value);
                }}
              />

              <AuthInput
                accessibilityLabel={t('auth.confirmPasswordPlaceholder')}
                autoCapitalize="none"
                autoComplete="new-password"
                autoCorrect={false}
                icon="lock.fill"
                placeholder={t('auth.confirmPasswordPlaceholder')}
                returnKeyType="done"
                secureTextEntry
                value={confirmPassword}
                onChangeText={(value) => {
                  setErrorKey(null);
                  setConfirmPassword(value);
                }}
                onSubmitEditing={() => void handleSubmit()}
              />

              {errorKey ? (
                <ThemedText lightColor={alertColor} darkColor={alertColor} style={styles.error}>
                  {t(errorKey)}
                </ThemedText>
              ) : null}

              <Button
                title={t('auth.resetPasswordButton')}
                accessibilityLabel={t('auth.resetPasswordButton')}
                onPress={() => void handleSubmit()}
                disabled={isSubmitting || isCheckingSession}
                style={styles.submit}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.surfaceDark,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
  },
  form: {
    gap: Spacing.md,
  },
  error: {
    ...Typography.caption,
  },
  submit: {
    marginTop: Spacing.xs,
    borderRadius: Radius.pill,
    minHeight: 52,
  },
});
