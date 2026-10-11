import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type Props = {
  count: number;
  width: number;
  height: number;
  index: number;
  onIndex: (i: number) => void;
  /** Tap on the current page (e.g. open the full-screen viewer). */
  onTap?: (i: number) => void;
  /** Off while a photo is zoomed, so the drag pans the photo instead. */
  enabled?: boolean;
  renderItem: (i: number) => ReactNode;
};

const EASE = { duration: 260 };

/**
 * Horizontal photo pager driven by a pan gesture, so swiping works the same with a finger, a mouse
 * and inside the web build (a paging ScrollView doesn't drag with a mouse). Rubber-bands at the ends.
 */
export function Pager({ count, width, height, index, onIndex, onTap, enabled = true, renderItem }: Props) {
  const x = useSharedValue(-index * width);
  const start = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(enabled && count > 1)
    .activeOffsetX([-10, 10])
    .failOffsetY([-14, 14])
    .onStart(() => {
      start.value = x.value;
    })
    .onUpdate((e) => {
      const min = -(count - 1) * width;
      let nx = start.value + e.translationX;
      if (nx > 0) nx *= 0.3;
      if (nx < min) nx = min + (nx - min) * 0.3;
      x.value = nx;
    })
    .onEnd((e) => {
      const from = Math.round(-start.value / width);
      const far = Math.abs(e.translationX) > width * 0.18 || Math.abs(e.velocityX) > 500;
      const next = Math.min(count - 1, Math.max(0, far ? from + (e.translationX < 0 ? 1 : -1) : from));
      x.value = withTiming(-next * width, EASE);
      if (next !== from) runOnJS(onIndex)(next);
    });

  const tap = Gesture.Tap()
    .enabled(!!onTap)
    .maxDistance(10)
    .onEnd((_e, ok) => {
      if (ok && onTap) runOnJS(onTap)(Math.round(-x.value / width));
    });

  // Thumbnails and parents can change the page too: animate to it.
  useEffect(() => {
    x.value = withTiming(-index * width, EASE);
  }, [index, width, x]);

  const row = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  // Web: pan-y keeps vertical page scrolling when a swipe starts on the photos.
  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)} touchAction="pan-y">
      <View style={{ width, height, overflow: 'hidden' }} accessibilityHint={count > 1 ? 'Swipe left or right for more photos' : undefined}>
        <Animated.View style={[{ flexDirection: 'row', width: width * count, height }, row]}>
          {Array.from({ length: count }, (_, i) => (
            <View key={i} style={{ width, height, overflow: 'hidden' }}>
              {renderItem(i)}
            </View>
          ))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
