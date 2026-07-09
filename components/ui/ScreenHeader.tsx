import { HeaderBackButton } from "expo-router/react-navigation";
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAndroidBackHandler } from '@/hooks/use-android-back-handler';
import { useThemeColor } from '@/hooks/use-theme-color';

type ScreenHeaderProps = {
  onBack: () => void;
  title?: string;
  backTintColor?: string;
};

export function ScreenHeader({ onBack, title, backTintColor }: ScreenHeaderProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const resolvedBackTintColor = backTintColor ?? primaryColor;

  useAndroidBackHandler(
    useCallback(() => {
      onBack();
      return true;
    }, [onBack])
  );

  return (
    <View style={styles.container}>
      <HeaderBackButton tintColor={resolvedBackTintColor} onPress={onBack} />
      {title ? (
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  title: {
    flex: 1,
  },
});
