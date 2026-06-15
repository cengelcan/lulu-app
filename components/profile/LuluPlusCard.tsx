import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ComingSoonModal } from '@/components/ui/ComingSoonModal';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user.store';

export function LuluPlusCard() {
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
          <ThemedText type="subtitle">Lulu Plus</ThemedText>
        </View>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.description}>
          {isPlusActive
            ? 'Your plan is active. Manage your subscription anytime.'
            : 'Unlock advanced reports, multi-caregiver sharing, and more.'}
        </ThemedText>
        <Button
          accessibilityLabel={isPlusActive ? 'Manage Lulu Plus' : 'Upgrade to Lulu Plus'}
          title={isPlusActive ? 'Manage' : 'Upgrade'}
          variant="secondary"
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
