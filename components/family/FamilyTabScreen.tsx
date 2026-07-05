import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { FamilyActiveContent } from '@/components/family/FamilyActiveContent';
import { FamilyEmptyContent } from '@/components/family/FamilyEmptyContent';
import { FamilyFreeUpsellContent } from '@/components/family/FamilyFreeUpsellContent';
import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing } from '@/constants/theme';
import { useFamilyPlusAccess } from '@/hooks/use-family-plus';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { useSharingStore } from '@/stores/sharing.store';
import { translateError } from '@/utils/translate-error';

type FamilyTabScreenProps = {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function FamilyTabScreen({ edges = ['top', 'bottom'] }: FamilyTabScreenProps) {
  const { t } = useTranslation();
  const { canUseFamilySharing } = useFamilyPlusAccess();
  const primaryColor = useThemeColor({}, 'primary');

  const familyGroup = useSharingStore((state) => state.familyGroup);
  const memberFamilyGroup = useSharingStore((state) => state.memberFamilyGroup);
  const members = useSharingStore((state) => state.members);
  const sharedPetIds = useSharingStore((state) => state.sharedPetIds);
  const isLoading = useSharingStore((state) => state.isLoading);
  const familyTabLoaded = useSharingStore((state) => state.familyTabLoaded);
  const error = useSharingStore((state) => state.error);
  const familyOwnerDisplayName = useSharingStore((state) => state.familyOwnerDisplayName);
  const loadFamilyTab = useSharingStore((state) => state.loadFamilyTab);

  useFocusEffect(
    useCallback(() => {
      const loaded = useSharingStore.getState().familyTabLoaded;
      void loadFamilyTab({ silent: loaded });
    }, [loadFamilyTab])
  );

  const activeGroup = familyGroup ?? memberFamilyGroup;
  const isOwner = Boolean(familyGroup);

  return (
    <ScreenContainer scrollable edges={edges} contentStyle={styles.content}>
      {error ? (
        <ThemedText style={styles.error}>{translateError(t, error)}</ThemedText>
      ) : null}

      {isLoading && !familyTabLoaded ? (
        <View style={styles.loading}>
          <ActivityIndicator color={primaryColor} size="large" />
        </View>
      ) : activeGroup ? (
        <FamilyActiveContent
          familyGroup={activeGroup}
          members={members}
          sharedPetIds={sharedPetIds}
          isOwner={isOwner}
          ownerDisplayName={familyOwnerDisplayName}
        />
      ) : canUseFamilySharing ? (
        <FamilyEmptyContent />
      ) : (
        <FamilyFreeUpsellContent />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: Spacing.lg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  error: {
    color: '#FF6B6B',
    marginBottom: Spacing.sm,
  },
});
