import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ComingSoonModal } from '@/components/ui/ComingSoonModal';
import { Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user.store';

export function LuluPlusCard() {
  const { t } = useTranslation();
  const isPlusActive = useUserStore((state) => state.isPlusActive);
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handlePress = () => {
    setIsModalVisible(true);
  };

  return (
    <>
      <Card>
        <View style={styles.header}>
          <ThemedText type="subtitle">{t('profile.luluPlus')}</ThemedText>
        </View>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.description}>
          {isPlusActive ? t('profile.luluPlusActive') : t('profile.luluPlusInactive')}
        </ThemedText>
        <Button
          accessibilityLabel={isPlusActive ? t('profile.manageA11y') : t('profile.upgradeA11y')}
          title={isPlusActive ? t('profile.manage') : t('profile.upgrade')}
          variant="primary"
          onPress={handlePress}
          style={styles.button}
        />
      </Card>

      <ComingSoonModal visible={isModalVisible} onDismiss={() => setIsModalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  description: {
    ...Typography.body,
  },
  button: {
    marginTop: Spacing.xs,
  },
});
