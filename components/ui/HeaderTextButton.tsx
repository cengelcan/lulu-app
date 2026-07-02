import { HeaderButton } from '@react-navigation/elements';
import { Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

const IOS_HEADER_ACTION_HEIGHT = 36;
const IOS_HEADER_TEXT_MIN_WIDTH = 44;
const IOS_HEADER_TEXT_CHAR_WIDTH = 8.5;
const IOS_HEADER_TEXT_HORIZONTAL_PADDING = 16;

type HeaderTextButtonProps = {
  accessibilityLabel: string;
  color: string;
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

function getIosHeaderTextButtonWidth(label: string): number {
  return Math.max(
    IOS_HEADER_TEXT_MIN_WIDTH,
    Math.ceil(label.length * IOS_HEADER_TEXT_CHAR_WIDTH) + IOS_HEADER_TEXT_HORIZONTAL_PADDING
  );
}

export function HeaderTextButton({
  accessibilityLabel,
  color,
  disabled = false,
  label,
  onPress,
}: HeaderTextButtonProps) {
  const iosDimensions =
    Platform.OS === 'ios'
      ? {
          width: getIosHeaderTextButtonWidth(label),
          height: IOS_HEADER_ACTION_HEIGHT,
        }
      : null;

  return (
    <View style={[styles.slot, iosDimensions]}>
      <HeaderButton
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        onPress={onPress}>
        <ThemedText lightColor={color} darkColor={color} type="defaultSemiBold" numberOfLines={1}>
          {label}
        </ThemedText>
      </HeaderButton>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignSelf: 'flex-end',
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
