import { HeaderButton } from "expo-router/react-navigation";
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

const IOS_HEADER_ACTION_HEIGHT = 40;
const IOS_HEADER_TEXT_MIN_WIDTH = 44;
const IOS_HEADER_TEXT_CHAR_WIDTH = 8.5;
const IOS_HEADER_TEXT_HORIZONTAL_PADDING = 16;
const HEADER_TEXT_MAX_FONT_SIZE_MULTIPLIER = 1.2;

type HeaderTextButtonProps = {
  accessibilityLabel: string;
  color: string;
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

function getIosHeaderTextButtonWidth(label: string, fontScale: number): number {
  const resolvedScale = Math.min(fontScale, HEADER_TEXT_MAX_FONT_SIZE_MULTIPLIER);

  return Math.max(
    IOS_HEADER_TEXT_MIN_WIDTH,
    Math.ceil(label.length * IOS_HEADER_TEXT_CHAR_WIDTH * resolvedScale) +
      IOS_HEADER_TEXT_HORIZONTAL_PADDING
  );
}

export function HeaderTextButton({
  accessibilityLabel,
  color,
  disabled = false,
  label,
  onPress,
}: HeaderTextButtonProps) {
  const { fontScale } = useWindowDimensions();
  const iosDimensions =
    Platform.OS === 'ios'
      ? {
          width: getIosHeaderTextButtonWidth(label, fontScale),
          height: IOS_HEADER_ACTION_HEIGHT,
        }
      : null;

  return (
    <View style={[styles.slot, iosDimensions]}>
      <HeaderButton
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        onPress={onPress}>
        <ThemedText
          lightColor={color}
          darkColor={color}
          type="defaultSemiBold"
          maxFontSizeMultiplier={HEADER_TEXT_MAX_FONT_SIZE_MULTIPLIER}
          numberOfLines={1}>
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
