import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { EditNameModal } from '@/components/profile/EditNameModal';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { pickImageFromGallery } from '@/services/pick-image-from-gallery';
import { useUserStore } from '@/stores/user.store';

const AVATAR_SIZE = 96;

export function UserCard() {
  const router = useRouter();

  const displayName = useUserStore((state) => state.displayName);
  const avatarUri = useUserStore((state) => state.avatarUri);
  const email = useUserStore((state) => state.email);
  const updateDisplayName = useUserStore((state) => state.updateDisplayName);
  const updateAvatarUri = useUserStore((state) => state.updateAvatarUri);

  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');

  const [isEditNameVisible, setIsEditNameVisible] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);

  const handleOpenSettings = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    router.push('/settings');
  };

  const handleChangePhoto = async () => {
    if (isPickingPhoto) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsPickingPhoto(true);

    try {
      const result = await pickImageFromGallery();

      if (result.ok) {
        await updateAvatarUri(result.uri);
      } else if (result.reason === 'permission_denied') {
        Alert.alert(
          'Photo Access Needed',
          'Allow photo access in Settings to choose a profile picture.'
        );
      }
    } catch {
      Alert.alert('Could Not Save Photo', 'Please try again.');
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const handleSaveName = async (value: string) => {
    setIsSavingName(true);

    try {
      await updateDisplayName(value);
      setIsEditNameVisible(false);
    } catch {
      Alert.alert('Could Not Save Name', 'Please try again.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleEditNamePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsEditNameVisible(true);
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Open Settings"
        accessibilityRole="button"
        hitSlop={8}
        onPress={handleOpenSettings}
        style={({ pressed }) => [styles.settingsButton, { opacity: pressed ? 0.7 : 1 }]}>
        <IconSymbol name="gearshape.fill" size={22} color={primaryColor} />
      </Pressable>

      <View style={styles.identity}>
        <Pressable
          accessibilityHint="Opens photo picker"
          accessibilityLabel="Change profile photo"
          accessibilityRole="button"
          disabled={isPickingPhoto}
          onPress={() => void handleChangePhoto()}
          style={({ pressed }) => [styles.avatarButton, { opacity: isPickingPhoto || pressed ? 0.85 : 1 }]}>
          {isPickingPhoto ? (
            <View style={styles.avatarLoading}>
              <UserAvatar photoUri={avatarUri} size={AVATAR_SIZE} showEditBadge />
              <ActivityIndicator color={primaryColor} style={styles.loadingIndicator} />
            </View>
          ) : (
            <UserAvatar photoUri={avatarUri} size={AVATAR_SIZE} showEditBadge />
          )}
        </Pressable>

        <Pressable
          accessibilityHint="Opens name editor"
          accessibilityLabel={displayName ? `Edit name, ${displayName}` : 'Add your name'}
          accessibilityRole="button"
          onPress={handleEditNamePress}
          style={({ pressed }) => [styles.nameRow, { opacity: pressed ? 0.7 : 1 }]}>
          {displayName ? (
            <ThemedText type="subtitle" style={styles.displayName}>
              {displayName}
            </ThemedText>
          ) : (
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.addName}>
              Add your name
            </ThemedText>
          )}
          <IconSymbol name="pencil" size={16} color={textSecondaryColor} />
        </Pressable>

        {email ? (
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.email}>
            {email}
          </ThemedText>
        ) : null}
      </View>

      <EditNameModal
        visible={isEditNameVisible}
        initialValue={displayName ?? ''}
        isSaving={isSavingName}
        onSave={(value) => void handleSaveName(value)}
        onCancel={() => {
          if (!isSavingName) {
            setIsEditNameVisible(false);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  settingsButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.md,
  },
  avatarButton: {
    marginBottom: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
  },
  displayName: {
    textAlign: 'center',
  },
  addName: {
    ...Typography.body,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  email: {
    ...Typography.caption,
    textAlign: 'center',
  },
  avatarLoading: {
    position: 'relative',
  },
  loadingIndicator: {
    ...StyleSheet.absoluteFillObject,
  },
});
