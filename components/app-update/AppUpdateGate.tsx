import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LuluLogo } from '@/components/LuluLogo';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useAppUpdate } from '@/hooks/use-app-update';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

export function AppUpdateGate() {
  const { t } = useTranslation();
  const { decision, dismiss, openStore, isOpeningStore, openStoreFailed } = useAppUpdate();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surfaceElevated');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const alertColor = useThemeColor({}, 'alert');

  if (!decision) {
    return null;
  }

  const isRequired = decision.kind === 'required';
  const title = isRequired ? t('appUpdate.requiredTitle') : t('appUpdate.title');
  const message = isRequired ? t('appUpdate.requiredMessage') : t('appUpdate.message');
  const versionLabel = t('appUpdate.versionLabel', { version: decision.latestVersion });

  const content = (
    <View
      accessibilityViewIsModal
      style={[
        isRequired ? styles.requiredCard : styles.optionalCard,
        { backgroundColor: isRequired ? backgroundColor : surfaceColor },
      ]}>
      {isRequired ? (
        <LuluLogo accessibilityLabel={t('welcome.appName')} size={112} />
      ) : (
        <View style={[styles.iconCircle, { backgroundColor: brandAccentSoft }]}>
          <IconSymbol name="arrow.down.circle" size={36} color={brandAccentColor} />
        </View>
      )}

      <View style={styles.copy}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.message}>
          {message}
        </ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.versionLabel}>
          {versionLabel}
        </ThemedText>
        {openStoreFailed ? (
          <ThemedText
            accessibilityLiveRegion="assertive"
            lightColor={alertColor}
            darkColor={alertColor}
            style={styles.error}>
            {t('appUpdate.openStoreFailed')}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button
          accessibilityLabel={t('appUpdate.updateButton')}
          disabled={isOpeningStore}
          title={t('appUpdate.updateButton')}
          onPress={() => void openStore()}
          style={styles.actionButton}
        />
        {!isRequired ? (
          <Button
            accessibilityLabel={t('appUpdate.laterButton')}
            title={t('appUpdate.laterButton')}
            variant="ghost"
            onPress={dismiss}
            style={styles.actionButton}
          />
        ) : null}
      </View>
    </View>
  );

  return (
    <Modal
      animationType={isRequired ? 'fade' : 'slide'}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible
      onRequestClose={isRequired ? () => {} : dismiss}>
      {isRequired ? (
        <SafeAreaView style={[styles.requiredRoot, { backgroundColor }]}>
          {content}
        </SafeAreaView>
      ) : (
        <Pressable
          accessibilityLabel={t('common.dismissDialog')}
          accessibilityRole="button"
          style={styles.backdrop}
          onPress={dismiss}>
          <Pressable style={styles.sheetWrap} onPress={(event) => event.stopPropagation()}>
            {content}
          </Pressable>
        </Pressable>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  sheetWrap: {
    width: '100%',
    maxWidth: 640,
  },
  optionalCard: {
    width: '100%',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderCurve: 'continuous',
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
    alignItems: 'center',
  },
  requiredRoot: {
    flex: 1,
  },
  requiredCard: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    maxWidth: 440,
  },
  versionLabel: {
    ...Typography.caption,
    textAlign: 'center',
  },
  error: {
    ...Typography.caption,
    textAlign: 'center',
    paddingTop: Spacing.xs,
  },
  actions: {
    width: '100%',
    gap: Spacing.xs,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});
