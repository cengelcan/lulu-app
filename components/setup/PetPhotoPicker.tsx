import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { PetSpecies } from '@/types/pet';

const PHOTO_PICKER_AVATAR_SIZE = 216;

type PetPhotoPickerProps = {
  species: PetSpecies | null;
  photoUri: string | null;
  addPhotoLabel: string;
  changePhotoLabel: string;
  addPhotoHint: string;
  isPicking: boolean;
  onPickPhoto: () => void;
};

export function PetPhotoPicker({
  species,
  photoUri,
  addPhotoLabel,
  changePhotoLabel,
  addPhotoHint,
  isPicking,
  onPickPhoto,
}: PetPhotoPickerProps) {
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatarFrame,
          {
            backgroundColor: surfaceColor,
            borderColor: photoUri ? brandAccentColor : borderColor,
            borderWidth: photoUri ? 2 : StyleSheet.hairlineWidth,
          },
        ]}>
        <PetAvatar
          photoUri={photoUri}
          species={photoUri ? null : species}
          size={PHOTO_PICKER_AVATAR_SIZE}
          accentBorder={Boolean(photoUri)}
        />
      </View>

      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.hint}>
        {addPhotoHint}
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={photoUri ? changePhotoLabel : addPhotoLabel}
        disabled={isPicking}
        onPress={onPickPhoto}
        style={({ pressed }) => [
          styles.actionButton,
          {
            backgroundColor: brandAccentSoft,
            borderColor: brandAccentColor,
            opacity: isPicking ? 0.7 : pressed ? 0.88 : 1,
          },
        ]}>
        {isPicking ? (
          <ActivityIndicator color={brandAccentColor} size="small" />
        ) : (
          <>
            <IconSymbol name="camera.fill" size={18} color={brandAccentColor} />
            <ThemedText
              type="defaultSemiBold"
              lightColor={brandAccentColor}
              darkColor={brandAccentColor}
              style={styles.actionLabel}>
              {photoUri ? changePhotoLabel : addPhotoLabel}
            </ThemedText>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  avatarFrame: {
    borderRadius: Radius.full,
    padding: Spacing.xs,
  },
  hint: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: 48,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  actionLabel: {
    ...Typography.bodySemiBold,
  },
});
