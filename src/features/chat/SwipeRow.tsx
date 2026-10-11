import { useEffect, type ReactNode } from 'react';
import { Platform, View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon, Pressable, Text, type IconName } from '@/components';

export type SwipeAction = { key: string; label: string; icon: IconName; color: string; onPress: () => void };

const ACTION_W = 76;
const EASE = { duration: 220 };
const noSelect = Platform.select<ViewStyle | undefined>({ web: { userSelect: 'none' } as ViewStyle, default: undefined });

/**
 * Chat row with actions behind it (EmpMessagesSwipe): swipe left to reveal, swipe right or tap to close.
 * The list keeps one row open at a time through `open` / `onOpen`.
 */
export function SwipeRow({
  actions,
  open,
  onOpen,
  onPress,
  label,
  children,
}: {
  actions: SwipeAction[];
  open: boolean;
  onOpen: (open: boolean) => void;
  onPress: () => void;
  label: string;
  children: ReactNode;
}) {
  const width = actions.length * ACTION_W;
  const x = useSharedValue(0);
  const start = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onStart(() => {
      start.value = x.value;
    })
    .onUpdate((e) => {
      let nx = start.value + e.translationX;
      if (nx > 0) nx = 0;
      if (nx < -width) nx = -width + (nx + width) * 0.25;
      x.value = nx;
    })
    .onEnd((e) => {
      const next = e.velocityX < -400 || (e.velocityX < 400 && x.value < -width / 2);
      x.value = withTiming(next ? -width : 0, EASE);
      runOnJS(onOpen)(next);
    });

  // Tap is a gesture too (not a Pressable): on web a Pressable inside swallows mouse drags.
  const tap = Gesture.Tap()
    .maxDistance(10)
    .onEnd((_e, ok) => {
      if (ok) runOnJS(onPress)();
    });

  // Another row opened (or an action ran): slide back.
  useEffect(() => {
    x.value = withTiming(open ? -width : 0, EASE);
  }, [open, width, x]);

  const row = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  // Hidden while closed, so the red action doesn't show through the card's rounded corners.
  const behind = useAnimatedStyle(() => ({ opacity: x.value < -1 ? 1 : 0 }));

  return (
    <View style={{ overflow: 'hidden' }}>
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        accessibilityElementsHidden={!open}
        importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
        style={[{ position: 'absolute', top: 0, right: 0, bottom: 0, flexDirection: 'row' }, behind]}>
        {actions.map((a) => (
          <Pressable
            key={a.key}
            onPress={() => (onOpen(false), a.onPress())}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            style={{ width: ACTION_W, backgroundColor: a.color, alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 4 }}>
            <Icon name={a.icon} size={22} color="#FFFFFF" />
            <Text variant="caption" weight={700} color="#FFFFFF" align="center" style={{ fontSize: 12, lineHeight: 14 }}>
              {a.label}
            </Text>
          </Pressable>
        ))}
      </Animated.View>
      {/* Web: pan-y keeps the list scrolling vertically when a swipe starts on a row. */}
      <GestureDetector gesture={Gesture.Race(pan, tap)} touchAction="pan-y">
        <Animated.View style={row}>
          {/* No text selection, so a mouse drag swipes the row instead of selecting its text. */}
          <View style={noSelect} accessible accessibilityRole="button" accessibilityLabel={label} accessibilityHint="Swipe left for Archive and Delete">
            {children}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
