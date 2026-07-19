import { Redirect, useFocusEffect } from 'expo-router';
import { useCallback, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSharingStore } from '@/stores/sharing.store';

type FamilyOwnerRouteGuardProps = {
  children: ReactNode;
};

export function FamilyOwnerRouteGuard({ children }: FamilyOwnerRouteGuardProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const familyGroup = useSharingStore((state) => state.familyGroup);
  const familyTabLoaded = useSharingStore((state) => state.familyTabLoaded);
  const isLoading = useSharingStore((state) => state.isLoading);
  const error = useSharingStore((state) => state.error);
  const loadFamilyTab = useSharingStore((state) => state.loadFamilyTab);

  useFocusEffect(
    useCallback(() => {
      void loadFamilyTab({ silent: familyTabLoaded });
    }, [familyTabLoaded, loadFamilyTab])
  );

  if (familyGroup) {
    return children;
  }

  if (!familyTabLoaded && !error) {
    return (
      <ScreenContainer edges={['bottom']} contentStyle={styles.loading}>
        <ActivityIndicator color={primaryColor} size="large" animating={isLoading || !error} />
      </ScreenContainer>
    );
  }

  return <Redirect href="/(tabs)/family" />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
