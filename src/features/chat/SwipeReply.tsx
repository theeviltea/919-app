import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Icon } from '@/components';
import { useTheme } from '@/theme';

const TRIGGER = 56;
const MAX = 80;

/**
 * Message row: swipe right to reply (as in WhatsApp / Telegram), long press for actions.
 * The row is full width, so the bubble's 78% max width is measured against the chat, not the bubble itself.
 */
export function SwipeReply({ mine, canReply, onReply, onLongPress, children }: { mine: boolean; canReply: boolean; onReply: () => void; onLongPress: () => void; children: ReactNode }) {
  const { c } = useTheme();
  const x = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(canReply)
    .runOnJS(true)
    .activeOffsetX(12)
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      const t = Math.max(0, e.translationX);
      x.value = t < TRIGGER ? t : TRIGGER + (t - TRIGGER) * 0.3;
      if (x.value > MAX) x.value = MAX;
    })
    .onEnd(() => {
      if (x.value >= TRIGGER) onReply();
    })
    .onFinalize(() => {
      x.value = withSpring(0, { damping: 18, stiffness: 220 });
    });
  const hold = Gesture.LongPress().runOnJS(true).minDuration(350).onStart(onLongPress);
  const gesture = Gesture.Race(pan, hold);

  const row = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const hint = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [8, TRIGGER], [0, 1], 'clamp'),
    transform: [{ scale: interpolate(x.value, [8, TRIGGER, MAX], [0.6, 1, 1.1], 'clamp') }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View collapsable={false} style={{ width: '100%' }} accessibilityHint={canReply ? 'Swipe right to reply, long press for actions' : 'Long press for actions'}>
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0, bottom: 0, justifyContent: 'center' }, hint]} pointerEvents="none">
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="reply" size={18} color="primary" />
          </View>
        </Animated.View>
        <Animated.View style={[{ width: '100%', alignItems: mine ? 'flex-end' : 'flex-start' }, row]}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
}
