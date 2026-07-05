import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FamilyMemberRow } from '@/components/family/FamilyMemberRow';
import { FamilyStatusCard } from '@/components/family/FamilyStatusCard';
import { SharedPetCard } from '@/components/family/SharedPetCard';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useFamilyPlusAccess } from '@/hooks/use-family-plus';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePetStore } from '@/stores/pet.store';
import { useSharingStore } from '@/stores/sharing.store';
import { useUserStore } from '@/stores/user.store';
import type { FamilyGroup, FamilyMemberSummary } from '@/types/sharing';
import { copyTextToClipboard } from '@/utils/copy-to-clipboard';
import { formatFamilyCode } from '@/utils/sharing/family-code';

type FamilyActiveContentProps = {
  familyGroup: FamilyGroup;
  members: FamilyMemberSummary[];
  sharedPetIds: string[];
  isOwner: boolean;
  ownerDisplayName?: string | null;
};

export function FamilyActiveContent({
  familyGroup,
  members,
  sharedPetIds,
  isOwner,
  ownerDisplayName = null,
}: FamilyActiveContentProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { canUseFamilySharing } = useFamilyPlusAccess();
  const userId = useUserStore((state) => state.userId);
  const displayName = useUserStore((state) => state.displayName);
  const pets = usePetStore((state) => state.pets);
  const leaveFamily = useSharingStore((state) => state.leaveFamily);
  const deactivateSharing = useSharingStore((state) => state.deactivateSharing);

  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const alertColor = useThemeColor({}, 'alert');

  const sharedPets = useMemo(
    () =>
      sharedPetIds
        .map((petId) => pets.find((pet) => pet.id === petId))
        .filter((pet): pet is NonNullable<typeof pet> => Boolean(pet && pet.status !== 'deceased')),
    [pets, sharedPetIds]
  );

  const memberCount = members.length + 1;

  const handleCopyInviteCode = async () => {
    const result = await copyTextToClipboard(formatFamilyCode(familyGroup.code));

    if (result === 'clipboard' && process.env.EXPO_OS === 'ios') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Alert.alert(t('sharing.codeCopiedTitle'), t('sharing.codeCopiedMessage'));
  };

  const handleLeave = () => {
    Alert.alert(t('sharing.leaveTitle'), t('sharing.leaveMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('sharing.leaveConfirm'),
        style: 'destructive',
        onPress: () => {
          void leaveFamily(familyGroup.id);
        },
      },
    ]);
  };

  const handleDeactivate = () => {
    Alert.alert(t('sharing.deactivateTitle'), t('sharing.deactivateMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('sharing.deactivateConfirm'),
        style: 'destructive',
        onPress: () => {
          void deactivateSharing();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FamilyStatusCard
        name={familyGroup.name}
        iconKey={familyGroup.iconKey}
        memberCount={memberCount}
        petCount={sharedPets.length}
        showPremiumBadge={canUseFamilySharing}
      />

      <View style={styles.sectionHeader}>
        <ThemedText type="defaultSemiBold">{t('family.sharedPets')}</ThemedText>
        <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/my-pets' as Href)}>
          <ThemedText lightColor={brandAccentColor} darkColor={brandAccentColor}>
            {t('family.seeAll')}
          </ThemedText>
        </Pressable>
      </View>

      {sharedPets.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petScroll}>
          {sharedPets.map((pet) => (
            <SharedPetCard
              key={pet.id}
              pet={pet}
              onPress={() => router.push(`/pet-profile?id=${pet.id}` as Href)}
            />
          ))}
        </ScrollView>
      ) : (
        <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor} style={styles.emptyText}>
          {t('family.noSharedPets')}
        </ThemedText>
      )}

      <View style={styles.sectionHeader}>
        <ThemedText type="defaultSemiBold">{t('family.members')}</ThemedText>
        {isOwner ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/family/members' as Href)}>
            <ThemedText lightColor={brandAccentColor} darkColor={brandAccentColor}>
              {t('family.manage')}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.membersCard, { borderColor }]}>
        {isOwner ? (
          <FamilyMemberRow
            displayName={displayName}
            roleLabel={t('family.roleOwner')}
            isOwner
            youSuffix={t('family.you')}
          />
        ) : (
          <FamilyMemberRow
            displayName={ownerDisplayName}
            roleLabel={t('family.roleOwner')}
            isOwner
          />
        )}
        {members.map((member) => (
          <FamilyMemberRow
            key={member.memberUserId}
            displayName={member.displayName}
            roleLabel={t('family.roleMember')}
            youSuffix={member.memberUserId === userId ? t('family.you') : null}
          />
        ))}
      </View>

      {isOwner ? (
        <>
          <Button
            title={t('family.inviteMember')}
            variant="secondary"
            leadingIcon={<IconSymbol name="person.badge.plus" size={18} color={brandAccentColor} />}
            onPress={() => void handleCopyInviteCode()}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/family/settings' as Href)}
            style={[styles.menuRow, { borderColor }]}>
            <IconSymbol name="gearshape.fill" size={20} color={textSecondaryColor} />
            <ThemedText style={styles.menuLabel}>{t('family.settings')}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleDeactivate}
            style={[styles.menuRow, { borderColor }]}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={alertColor} />
            <ThemedText style={[styles.menuLabel, { color: alertColor }]}>
              {t('sharing.deactivateSharing')}
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
          </Pressable>
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={handleLeave}
          style={[styles.menuRow, { borderColor }]}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={alertColor} />
          <ThemedText style={[styles.menuLabel, { color: alertColor }]}>{t('sharing.leaveFamily')}</ThemedText>
          <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  petScroll: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  emptyText: {
    ...Typography.body,
    paddingVertical: Spacing.sm,
  },
  membersCard: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  menuLabel: {
    flex: 1,
    ...Typography.body,
  },
});
