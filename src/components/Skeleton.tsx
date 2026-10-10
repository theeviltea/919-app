import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

type Props = { width?: DimensionValue; height: number; radius?: number; strong?: boolean; style?: StyleProp<ViewStyle> };

/** Skeleton bar with a shimmer. `strong` for photos, avatars and buttons. */
export function Skeleton({ width = '100%', height, radius = 6, strong, style }: Props) {
  const { c, scheme } = useTheme();
  const t = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [t]);
  const glow = scheme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.65)';
  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: radius, overflow: 'hidden', backgroundColor: strong ? c.skeletonStrong : c.skeleton }, style]}>
      {w > 0 ? (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: w,
            experimental_backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0), ${glow}, rgba(255,255,255,0))`,
            transform: [{ translateX: t.interpolate({ inputRange: [0, 1], outputRange: [-w, w] }) }],
          }}
        />
      ) : null}
    </View>
  );
}
