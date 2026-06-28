import { LinearGradient } from 'expo-linear-gradient';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthFeedback } from '@/components/auth/AuthFeedback';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthLegalNotice } from '@/components/auth/AuthLegalNotice';
import { SocialAuthSection } from '@/components/auth/SocialAuthSection';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import {
  AuthError,
  type AuthErrorCode,
  requestPasswordReset,
} from '@/services/auth';
import * as petStorage from '@/storage/pet.storage';
import { usePetStore } from '@/stores/pet.store';
import { useUserStore } from '@/stores/user.store';

type AuthMode = 'signIn' | 'signUp';

const PASSWORD_MIN_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SIGN_UP_MODE_PARAM = 'signUp';

function resolveAuthMode(modeParam?: string | string[]): AuthMode {
  const value = Array.isArray(modeParam) ? modeParam[0] : modeParam;
  return value === SIGN_UP_MODE_PARAM ? 'signUp' : 'signIn';
}

async function resolvePostAuthRoute(): Promise<Href> {
  const hasAnyPet = await petStorage.hasAnyPet();
  return hasAnyPet ? '/(tabs)/home' : '/(setup)/pet-type';
}

export default function AuthScreen() {
  const router = useRouter();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string | string[] }>();
  const { t } = useTranslation();

  const signInWithEmail = useUserStore((state) => state.signInWithEmail);
  const signUpWithEmail = useUserStore((state) => state.signUpWithEmail);
  const loadPets = usePetStore((state) => state.loadPets);

  const [mode, setMode] = useState<AuthMode>(() => resolveAuthMode(modeParam));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  useEffect(() => {
    setMode(resolveAuthMode(modeParam));
  }, [modeParam]);

  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const alertColor = useThemeColor({}, 'alert');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  const isSignUp = mode === 'signUp';

  const handleSubmit = useCallback(async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorKey('auth.errors.emailRequired');
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setErrorKey('auth.errors.emailInvalid');
      return;
    }

    if (!password) {
      setErrorKey('auth.errors.passwordRequired');
      return;
    }

    if (isSignUp && password.length < PASSWORD_MIN_LENGTH) {
      setErrorKey('auth.errors.passwordTooShort');
      return;
    }

    if (isSignUp && !confirmPassword) {
      setErrorKey('auth.errors.confirmPasswordRequired');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setErrorKey('auth.errors.passwordMismatch');
      return;
    }

    setErrorKey(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { needsEmailConfirmation } = await signUpWithEmail(trimmedEmail, password);

        if (needsEmailConfirmation) {
          setConfirmEmailSent(true);
          setMode('signIn');
          setPassword('');
          setConfirmPassword('');
          return;
        }
      } else {
        await signInWithEmail(trimmedEmail, password);
      }

      await loadPets();
      router.replace(await resolvePostAuthRoute());
    } catch (error) {
      const code: AuthErrorCode = error instanceof AuthError ? error.code : 'unknown';
      setErrorKey(`auth.errors.${code}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    confirmPassword,
    email,
    isSignUp,
    loadPets,
    password,
    router,
    signInWithEmail,
    signUpWithEmail,
    t,
  ]);

  const toggleMode = useCallback(() => {
    setMode((current) => (current === 'signIn' ? 'signUp' : 'signIn'));
    setErrorKey(null);
    setConfirmPassword('');
    setConfirmEmailSent(false);
  }, []);

  const handleForgotPassword = useCallback(async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorKey('auth.errors.emailRequired');
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setErrorKey('auth.errors.emailInvalid');
      return;
    }

    setErrorKey(null);
    setResetEmailSent(false);
    setIsSubmitting(true);

    try {
      await requestPasswordReset(trimmedEmail);
      setResetEmailSent(true);
    } catch (error) {
      const code: AuthErrorCode = error instanceof AuthError ? error.code : 'unknown';
      setErrorKey(`auth.errors.${code}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, t]);

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
                {isSignUp ? t('auth.titleSignUp') : t('auth.title')}
              </ThemedText>
              <IconSymbol name="pawprint.fill" size={24} color={brandAccentColor} />
            </View>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.subtitle}>
              {isSignUp ? t('auth.subtitleSignUp') : t('auth.subtitle')}
            </ThemedText>
          </View>

          <View style={styles.form}>
            <AuthInput
              accessibilityLabel={t('auth.emailLabel')}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              icon="envelope.fill"
              inputMode="email"
              keyboardType="email-address"
              placeholder={t('auth.emailPlaceholder')}
              returnKeyType="next"
              value={email}
              onChangeText={(value) => {
                setErrorKey(null);
                setResetEmailSent(false);
                setConfirmEmailSent(false);
                setEmail(value);
              }}
            />

            <AuthInput
              accessibilityLabel={t('auth.passwordLabel')}
              autoCapitalize="none"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              autoCorrect={false}
              icon="lock.fill"
              placeholder={t('auth.passwordPlaceholder')}
              returnKeyType={isSignUp ? 'next' : 'done'}
              secureTextEntry
              value={password}
              onChangeText={(value) => {
                setErrorKey(null);
                setPassword(value);
              }}
              onSubmitEditing={isSignUp ? undefined : () => void handleSubmit()}
            />

            {isSignUp ? (
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
            ) : (
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={() => void handleForgotPassword()}
                style={styles.forgotPassword}>
                <Text allowFontScaling style={[styles.forgotPasswordText, { color: brandAccentColor }]}>
                  {t('auth.forgotPassword')}
                </Text>
              </Pressable>
            )}

            {confirmEmailSent ? (
              <AuthFeedback
                variant="info"
                title={t('auth.confirmEmailTitle')}
                message={t('auth.confirmEmailMessage')}
              />
            ) : null}

            {resetEmailSent ? (
              <AuthFeedback
                variant="info"
                title={t('auth.resetPasswordTitle')}
                message={t('auth.resetPasswordMessage')}
              />
            ) : null}

            {errorKey ? (
              <ThemedText lightColor={alertColor} darkColor={alertColor} style={styles.error}>
                {t(errorKey)}
              </ThemedText>
            ) : null}

            <Button
              title={isSignUp ? t('auth.signUpButton') : t('auth.signInButton')}
              accessibilityLabel={isSignUp ? t('auth.signUpButton') : t('auth.signInButton')}
              onPress={() => void handleSubmit()}
              disabled={isSubmitting}
              style={styles.submit}
            />
          </View>

          <SocialAuthSection />

          <Pressable
            accessibilityRole="button"
            onPress={toggleMode}
            disabled={isSubmitting}
            style={styles.toggle}>
            <Text allowFontScaling style={[styles.togglePrefix, { color: Palette.onDark }]}>
              {isSignUp ? t('auth.toggleToSignInPrefix') : t('auth.toggleToSignUpPrefix')}
              <Text style={{ color: brandAccentColor, fontWeight: '600' }}>
                {isSignUp ? t('auth.toggleToSignInLink') : t('auth.toggleToSignUpLink')}
              </Text>
            </Text>
          </Pressable>

          <AuthLegalNotice />
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.xs,
  },
  forgotPasswordText: {
    ...Typography.body,
  },
  error: {
    ...Typography.caption,
  },
  submit: {
    marginTop: Spacing.xs,
    borderRadius: Radius.pill,
    minHeight: 52,
  },
  toggle: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  togglePrefix: {
    ...Typography.body,
    textAlign: 'center',
  },
});
