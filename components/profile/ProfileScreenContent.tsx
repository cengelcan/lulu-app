import { useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { CommunityCard } from '@/components/profile/CommunityCard';
import { LegalCard } from '@/components/profile/LegalCard';
import { LuluPlusCard } from '@/components/profile/LuluPlusCard';
import { UserCard } from '@/components/profile/UserCard';
import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user.store';

type ProfileScreenContentProps = {
  edges?: Edge[];
};

function getAppVersionLabel(): string {
  const version = Constants.expoConfig?.version ?? Constants.nativeApplicationVersion ?? '1.0.0';
  return `Lulu v${version}`;
}

export function ProfileScreenContent({ edges = ['top', 'bottom'] }: ProfileScreenContentProps) {
  const loadUserProfile = useUserStore((state) => state.loadUserProfile);
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  useFocusEffect(
    useCallback(() => {
      void loadUserProfile();
    }, [loadUserProfile])
  );

  return (
    <ScreenContainer scrollable edges={edges} contentStyle={styles.content}>
      <View style={styles.body}>
        <UserCard />
        <LuluPlusCard />
        <CommunityCard />
        <LegalCard />
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.version}>
          {getAppVersionLabel()}
        </ThemedText>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  body: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  version: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
