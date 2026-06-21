import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

export default function ReportsScreen() {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <>
      <Stack.Screen
        options={{
          ...STACK_BACK_ONLY_OPTIONS,
          headerShown: true,
          title: t('reports.title'),
        }}
      />
      <ScreenContainer edges={['bottom']} contentStyle={styles.content}>
        <View style={styles.placeholder}>
          <ThemedText type="subtitle" style={styles.title}>
            {t('reports.comingSoonTitle')}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.message}>
            {t('reports.comingSoonMessage')}
          </ThemedText>
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
  },
});
