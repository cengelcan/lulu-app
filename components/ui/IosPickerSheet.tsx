import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HEADER_ACTION_WIDTH = 72;

export const IOS_PICKER_HEIGHT = 216;
export const IOS_PICKER_WIDTH = SCREEN_WIDTH;

type IosPickerSheetProps = {
  visible: boolean;
  title: string;
  leftAction?: {
    label: string;
    onPress: () => void;
  };
  onDone: () => void;
  onClose: () => void;
  children: React.ReactNode;
};

export function IosPickerSheet({
  visible,
  title,
  leftAction,
  onDone,
  onClose,
  children,
}: IosPickerSheetProps) {
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: surfaceColor }]}
          onPress={(event) => event.stopPropagation()}>
          <View style={[styles.sheetHeader, { borderBottomColor: borderColor }]}>
            {leftAction ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={leftAction.onPress}
                style={styles.headerAction}>
                <ThemedText
                  lightColor={textSecondaryColor}
                  darkColor={textSecondaryColor}
                  style={styles.headerActionText}
                  numberOfLines={1}>
                  {leftAction.label}
                </ThemedText>
              </Pressable>
            ) : (
              <View style={styles.headerAction} />
            )}

            <ThemedText type="defaultSemiBold" style={styles.headerTitle} numberOfLines={1}>
              {title}
            </ThemedText>

            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={onDone}
              style={styles.headerAction}>
              <ThemedText type="defaultSemiBold" style={styles.headerActionTextRight} numberOfLines={1}>
                Done
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.pickerContainer}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: Spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerAction: {
    width: HEADER_ACTION_WIDTH,
    justifyContent: 'center',
  },
  headerActionText: {
    textAlign: 'left',
  },
  headerActionTextRight: {
    textAlign: 'right',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  pickerContainer: {
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
