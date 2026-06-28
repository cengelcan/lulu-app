import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { AuthError, type AuthErrorCode } from '@/services/auth';
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
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(resolveAuthMode(modeParam));
  }, [modeParam]);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const alertColor = useThemeColor({}, 'alert');
  const primaryColor = useThemeColor({}, 'primary');

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

    setErrorKey(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { needsEmailConfirmation } = await signUpWithEmail(trimmedEmail, password);

        if (needsEmailConfirmation) {
          Alert.alert(t('auth.confirmEmailTitle'), t('auth.confirmEmailMessage'));
          setMode('signIn');
          setPassword('');
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
  }, [email, isSignUp, loadPets, password, router, signInWithEmail, signUpWithEmail, t]);

  const toggleMode = useCallback(() => {
    setMode((current) => (current === 'signIn' ? 'signUp' : 'signIn'));
    setErrorKey(null);
  }, []);

  return (
    <ScreenContainer scrollable contentStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText accessibilityRole="header" type="title">
          {isSignUp ? t('auth.titleSignUp') : t('auth.title')}
        </ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.subtitle}>
          {isSignUp ? t('auth.subtitleSignUp') : t('auth.subtitle')}
        </ThemedText>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <ThemedText style={styles.label}>{t('auth.emailLabel')}</ThemedText>
          <TextInput
            accessibilityLabel={t('auth.emailLabel')}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            inputMode="email"
            keyboardType="email-address"
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor={textSecondaryColor}
            returnKeyType="next"
            style={[styles.input, { color: textColor, backgroundColor: surfaceColor, borderColor }]}
            value={email}
            onChangeText={(value) => {
              setErrorKey(null);
              setEmail(value);
            }}
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>{t('auth.passwordLabel')}</ThemedText>
          <TextInput
            accessibilityLabel={t('auth.passwordLabel')}
            autoCapitalize="none"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            autoCorrect={false}
            secureTextEntry
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor={textSecondaryColor}
            returnKeyType="done"
            style={[styles.input, { color: textColor, backgroundColor: surfaceColor, borderColor }]}
            value={password}
            onChangeText={(value) => {
              setErrorKey(null);
              setPassword(value);
            }}
            onSubmitEditing={() => void handleSubmit()}
          />
        </View>

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

      <Pressable
        accessibilityRole="button"
        onPress={toggleMode}
        disabled={isSubmitting}
        style={styles.toggle}>
        <ThemedText lightColor={primaryColor} darkColor={primaryColor} style={styles.toggleText}>
          {isSignUp ? t('auth.toggleToSignIn') : t('auth.toggleToSignUp')}
        </ThemedText>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  header: {
    gap: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
  },
  form: {
    gap: Spacing.md,
  },
  field: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography.caption,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  error: {
    ...Typography.caption,
  },
  submit: {
    marginTop: Spacing.sm,
  },
  toggle: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  toggleText: {
    ...Typography.bodySemiBold,
  },
});
