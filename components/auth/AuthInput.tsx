import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type AuthInputProps = Omit<TextInputProps, 'style'> & {
  icon: IconSymbolName;
  secureToggle?: boolean;
};

export function AuthInput({ icon, secureToggle, secureTextEntry, ...rest }: AuthInputProps) {
  const [isHidden, setIsHidden] = useState(Boolean(secureTextEntry));

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'textSecondary');

  const showSecureToggle = secureToggle ?? secureTextEntry;

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor, borderColor }]}>
      <IconSymbol name={icon} size={20} color={iconColor} style={styles.leadingIcon} />
      <TextInput
        placeholderTextColor={textSecondaryColor}
        secureTextEntry={showSecureToggle ? isHidden : secureTextEntry}
        style={[styles.input, { color: textColor }]}
        {...rest}
      />
      {showSecureToggle ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isHidden ? 'Show password' : 'Hide password'}
          hitSlop={8}
          onPress={() => setIsHidden((current) => !current)}
          style={styles.trailingButton}>
          <IconSymbol name={isHidden ? 'eye.fill' : 'eye.slash'} size={20} color={iconColor} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.lg,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
  },
  leadingIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    ...Typography.body,
    flex: 1,
    paddingVertical: Spacing.md,
  },
  trailingButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xxs,
  },
});
