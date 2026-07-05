import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { useSharingStore } from '@/stores/sharing.store';
import { translateError } from '@/utils/translate-error';

export function FamilyMembersContent() {
  const { t } = useTranslation();
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  const familyGroup = useSharingStore((state) => state.familyGroup);
  const members = useSharingStore((state) => state.members);
  const loadOwnerFamilySharing = useSharingStore((state) => state.loadOwnerFamilySharing);
  const removeMember = useSharingStore((state) => state.removeMember);

  useFocusEffect(
    useCallback(() => {
      void loadOwnerFamilySharing();
    }, [loadOwnerFamilySharing])
  );

  const handleRemoveMember = (memberUserId: string, displayName: string | null) => {
    if (!familyGroup) {
      return;
    }

    Alert.alert(
      t('sharing.removeMemberTitle'),
      t('sharing.removeMemberMessage', { name: displayName ?? t('sharing.someone') }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('sharing.removeMemberConfirm'),
          style: 'destructive',
          onPress: () => {
            void removeMember(familyGroup.id, memberUserId).catch((removeError) => {
              Alert.alert(
                t('sharing.errorTitle'),
                translateError(
                  t,
                  removeError instanceof Error ? removeError.message : 'errors.unknown'
                ) ?? t('errors.unknown')
              );
            });
          },
        },
      ]
    );
  };

  if (!familyGroup) {
    return null;
  }

  return (
    <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
      <GroupedSection title={t('sharing.membersSection')}>
        {members.length === 0 ? (
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.emptyMembers}>
            {t('sharing.noMembers')}
          </ThemedText>
        ) : (
          members.map((member, index) => (
            <View
              key={member.memberUserId}
              style={[
                styles.memberRow,
                index < members.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: borderColor,
                },
              ]}>
              <View style={styles.memberInfo}>
                <ThemedText type="defaultSemiBold">
                  {member.displayName ?? t('sharing.unnamedMember')}
                </ThemedText>
                <ThemedText
                  lightColor={textSecondaryColor}
                  darkColor={textSecondaryColor}
                  style={styles.memberMeta}>
                  {t('sharing.memberPetCount', { count: member.petIds.length })}
                </ThemedText>
              </View>
              <Pressable onPress={() => handleRemoveMember(member.memberUserId, member.displayName)}>
                <ThemedText lightColor={brandAccentColor} darkColor={brandAccentColor}>
                  {t('sharing.removeMember')}
                </ThemedText>
              </Pressable>
            </View>
          ))
        )}
      </GroupedSection>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingTop: Spacing.sm,
  },
  emptyMembers: {
    padding: Spacing.md,
    ...Typography.body,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 56,
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberMeta: {
    ...Typography.caption,
  },
});
