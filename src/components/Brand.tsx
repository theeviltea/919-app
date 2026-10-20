import { Image } from 'expo-image';
import { useEffect, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import { logoXml, patternTileXml } from '@/icons/brand';
import { useTheme } from '@/theme';

/** 919 logo — white only, on brand blue. Proportions 525×290. */
export function Logo({ height = 24 }: { height?: number }) {
  return <SvgXml xml={logoXml} height={height} width={(height * 525) / 290} color="#FFFFFF" accessibilityLabel="919" />;
}

/** Vector brand pattern (splash, DS cover): tile 375×467.424 on #3F94FF, repeated in both directions edge to edge.
 *  `animated`: the tiles settle in from a slight zoom and then drift upward in a seamless loop. */
export function VectorPattern({ width, height, animated }: { width: number; height: number; animated?: boolean }) {
  const { c } = useTheme();
  // One tile across on phones; on wide windows (web preview) more columns so tiles stay phone-sized.
  const cols = Math.max(1, Math.ceil(width / 480));
  const tileW = width / cols;
  const tileH = (tileW * 467.424) / 375;
  const rows = Math.ceil(height / tileH) + 1; // +1 so the loop never shows a gap
  const y = useSharedValue(0);
  const enter = useSharedValue(animated ? 0 : 1);
  useEffect(() => {
    if (!animated) return;
    enter.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) });
    y.value = 0;
    y.value = withRepeat(withTiming(-tileH, { duration: (tileH / 22) * 1000, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(y);
  }, [animated, tileH, y, enter]);
  const layer = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: y.value }, { scale: 1.12 - 0.12 * enter.value }],
  }));

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'hidden', backgroundColor: '#3F94FF' }}>
      <Animated.View style={[{ width, height: rows * tileH, flexDirection: 'row', flexWrap: 'wrap' }, layer]}>
        {Array.from({ length: rows * cols }, (_, i) => (
          <View key={i} style={{ width: tileW, height: tileH, flexShrink: 0 }}>
            <SvgXml xml={patternTileXml} width={tileW} height={tileH} preserveAspectRatio="none" color={c.primary} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

/** Blue header with the 3D pattern at 50% (main screens, guest zone). Radius 32 at the bottom. */
export function PatternHeader({ children, style, radius = 32 }: { children: ReactNode; style?: StyleProp<ViewStyle>; radius?: number }) {
  const { c } = useTheme();
  return (
    <View style={[{ backgroundColor: c.primary, borderBottomLeftRadius: radius, borderBottomRightRadius: radius, overflow: 'hidden' }, style]}>
      <Image
        source={require('@/assets/images/pattern-3d.jpg')}
        contentFit="cover"
        contentPosition="top"
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: 0.5 }}
        accessibilityElementsHidden
      />
      {children}
    </View>
  );
}
