import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { getPendingFamilyJoinCode } from '@/storage/pending-family-join.storage';
import { useUserStore } from '@/stores/user.store';
import { translateError } from '@/utils/translate-error';

export default function JoinDisplayNameScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const updateDisplayName = useUserStore((state) => state.updateDisplayName);
  const isLoading = useUserStore((state) => state.isLoading);

  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');

  const handleContinue = useCallback(async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setError('setup.joinDisplayName.validationRequired');
      return;
    }

    setError(null);

    try {
      await updateDisplayName(trimmed);
      const pendingCode = await getPendingFamilyJoinCode();

      if (pendingCode) {
        router.replace(`/join-family?code=${pendingCode}` as Href);
        return;
      }

      router.replace('/join-family' as Href);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'errors.unknown');
    }
  }, [name, router, updateDisplayName]);

  return (
    <ScreenContainer scrollable contentStyle={styles.content}>
      <View style={styles.body}>
        <ThemedText type="title" style={styles.title}>
          {t('setup.joinDisplayName.title')}
        </ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.description}>
          {t('setup.joinDisplayName.description')}
        </ThemedText>

        <TextInput
          accessibilityLabel={t('setup.joinDisplayName.label')}
          autoCapitalize="words"
          autoCorrect={false}
          placeholder={t('setup.joinDisplayName.placeholder')}
          placeholderTextColor={textSecondaryColor}
          value={name}
          onChangeText={(value) => {
            setError(null);
            setName(value);
          }}
          style={[styles.input, { color: textColor, borderColor, backgroundColor: surfaceColor }]}
        />

        {error ? (
          <ThemedText style={styles.error}>{translateError(t, error)}</ThemedText>
        ) : null}

        <Button
          title={t('common.continue')}
          onPress={() => void handleContinue()}
          disabled={isLoading}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  body: {
    flex: 1,
    gap: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    ...Typography.body,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 52,
    ...Typography.body,
  },
  error: {
    color: '#FF6B6B',
    ...Typography.caption,
  },
});
