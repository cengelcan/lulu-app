import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const AVATAR_COLORS = [
  Palette.badgePink,
  '#60A5FA',
  Palette.badgeEmerald,
  Palette.badgeViolet,
  Palette.badgeOrange,
];

function getInitials(displayName: string | null): string {
  if (!displayName?.trim()) {
    return '?';
  }

  const parts = displayName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function getAvatarColor(seed: string): string {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

type FamilyMemberRowProps = {
  displayName: string | null;
  roleLabel: string;
  isOwner?: boolean;
  youSuffix?: string | null;
};

export function FamilyMemberRow({
  displayName,
  roleLabel,
  isOwner = false,
  youSuffix = null,
}: FamilyMemberRowProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const borderColor = useThemeColor({}, 'border');
  const seed = displayName ?? 'member';
  const initials = getInitials(displayName);
  const avatarColor = getAvatarColor(seed);

  return (
    <View style={[styles.row, { borderBottomColor: borderColor }]}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <ThemedText style={styles.initials}>{initials}</ThemedText>
      </View>
      <View style={styles.info}>
        <ThemedText type="defaultSemiBold">
          {displayName ?? '—'}
          {youSuffix ? ` ${youSuffix}` : ''}
        </ThemedText>
        <View style={styles.roleRow}>
          <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor} style={styles.role}>
            {roleLabel}
          </ThemedText>
          {isOwner ? <IconSymbol name="crown.fill" size={12} color={brandAccentColor} /> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  role: {
    ...Typography.caption,
  },
});
