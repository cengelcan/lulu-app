import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { CheckInOptionCard } from '@/components/check-in/CheckInOptionCard';
import type { IconSymbolName } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';

export type SnapCarouselOption<T extends string> = {
  value: T;
  label: string;
  icon: IconSymbolName;
};

type SnapOptionCarouselProps<T extends string> = {
  options: SnapCarouselOption<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
  categoryLabel: string;
};

const CARD_GAP = 12;
const CARD_WIDTH_RATIO = 0.72;

export function SnapOptionCarousel<T extends string>({
  options,
  selected,
  onSelect,
  categoryLabel,
}: SnapOptionCarouselProps<T>) {
  const { width: screenWidth } = useWindowDimensions();
  const listRef = useRef<FlatList<SnapCarouselOption<T>>>(null);
  const isUserScrolling = useRef(false);

  const cardWidth = useMemo(() => Math.round(screenWidth * CARD_WIDTH_RATIO), [screenWidth]);
  const sidePadding = useMemo(() => (screenWidth - cardWidth) / 2, [cardWidth, screenWidth]);
  const snapInterval = cardWidth + CARD_GAP;

  const selectedIndex = useMemo(() => {
    if (selected === null) {
      const normalIndex = options.findIndex((option) => option.value === 'normal');
      return normalIndex >= 0 ? normalIndex : 0;
    }

    const index = options.findIndex((option) => option.value === selected);
    return index >= 0 ? index : 0;
  }, [options, selected]);

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      listRef.current?.scrollToOffset({
        offset: index * snapInterval,
        animated,
      });
    },
    [snapInterval]
  );

  useEffect(() => {
    if (!isUserScrolling.current) {
      scrollToIndex(selectedIndex, false);
    }
  }, [scrollToIndex, selectedIndex]);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isUserScrolling.current = false;
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / snapInterval);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    onSelect(options[clampedIndex].value);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        horizontal
        data={options}
        keyExtractor={(item) => item.value}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
        getItemLayout={(_, index) => ({
          length: snapInterval,
          offset: snapInterval * index,
          index,
        })}
        onScrollBeginDrag={() => {
          isUserScrolling.current = true;
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item, index }) => (
          <View style={[styles.item, { width: cardWidth, marginRight: CARD_GAP }]}>
            <CheckInOptionCard
              label={item.label}
              icon={item.icon}
              selected={selected === item.value}
              onPress={() => {
                onSelect(item.value);
                scrollToIndex(index, true);
              }}
              accessibilityLabel={`${categoryLabel}, ${item.label}, ${index + 1} of ${options.length}`}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -Spacing.lg,
  },
  item: {
    alignItems: 'stretch',
  },
});
