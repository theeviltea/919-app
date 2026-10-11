import { Image } from 'expo-image';
import type { ImageSourcePropType } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const MAX = 4;
const DOUBLE = 2.5;

/** Pinch to zoom, drag when zoomed, double tap to toggle. Reports zoom so the pager can lock paging. */
export function ZoomableImage({ source, width, height, onZoom }: { source: ImageSourcePropType; width: number; height: number; onZoom: (zoomed: boolean) => void }) {
  const scale = useSharedValue(1);
  const saved = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);

  const clampPan = () => {
    'worklet';
    const mx = ((scale.value - 1) * width) / 2;
    const my = ((scale.value - 1) * height) / 2;
    tx.value = Math.min(mx, Math.max(-mx, tx.value));
    ty.value = Math.min(my, Math.max(-my, ty.value));
  };
  const reset = () => {
    'worklet';
    scale.value = withTiming(1);
    saved.value = 1;
    tx.value = withTiming(0);
    ty.value = withTiming(0);
    runOnJS(onZoom)(false);
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(MAX, Math.max(0.8, saved.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value <= 1.05) reset();
      else {
        saved.value = scale.value;
        clampPan();
        runOnJS(onZoom)(true);
      }
    });
  const pan = Gesture.Pan()
    .minPointers(1)
    .manualActivation(true)
    .onTouchesMove((_e, state) => {
      // Only take the drag while zoomed; at 1× the pager scrolls.
      if (saved.value > 1) state.activate();
      else state.fail();
    })
    .onStart(() => {
      sx.value = tx.value;
      sy.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = sx.value + e.translationX;
      ty.value = sy.value + e.translationY;
      clampPan();
    });
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (saved.value > 1) reset();
      else {
        scale.value = withTiming(DOUBLE);
        saved.value = DOUBLE;
        runOnJS(onZoom)(true);
      }
    });

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }] }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinch, pan, doubleTap)}>
      <Animated.View style={[{ width, height, alignItems: 'center', justifyContent: 'center' }, style]}>
        <Image source={source} contentFit="contain" style={{ width, height }} />
      </Animated.View>
    </GestureDetector>
  );
}
