import { Image } from 'expo-image';
import { Pressable as RNPressable } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { useTheme } from '@/theme';

import { Logo } from './Brand';
import { Icon } from './Icon';
import { Text } from './Text';

/** Geometry of the collapsing header, shared with the screen for content padding and snapping. */
export function headerMetrics(insetTop: number) {
  const expanded = insetTop + 222;
  const collapsed = insetTop + 64;
  return { expanded, collapsed, range: expanded - collapsed };
}

type Props = {
  scrollY: SharedValue<number>;
  insetTop: number;
  title: string;
  searchPlaceholder: string;
  onSearch: () => void;
  /** Right-side action, e.g. Sign in. Moves from the logo row into the search row as the header collapses. */
  action?: { label: string; onPress: () => void };
};

const ACTION_W = 84;

/**
 * Brand header that minimises with scroll: the logo and title fade and lift away, the search bar rides up
 * into one compact row with the action, the bottom radius tightens. Overscroll stretches the pattern.
 */
export function CollapsingHeader({ scrollY, insetTop, title, searchPlaceholder, onSearch, action }: Props) {
  const { c } = useTheme();
  const { expanded, collapsed, range } = headerMetrics(insetTop);

  const box = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [-120, 0, range], [expanded + 120, expanded, collapsed], Extrapolation.CLAMP),
    borderBottomLeftRadius: interpolate(scrollY.value, [0, range], [32, 24], Extrapolation.CLAMP),
    borderBottomRightRadius: interpolate(scrollY.value, [0, range], [32, 24], Extrapolation.CLAMP),
  }));
  const pattern = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, range], [0, -range * 0.35], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [-120, 0], [1.25, 1], Extrapolation.CLAMP) },
    ],
  }));
  const logo = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, range * 0.35], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, range], [0, -24], Extrapolation.CLAMP) }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, range * 0.55], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, range], [0, -48], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [0, range], [1, 0.94], Extrapolation.CLAMP) },
    ],
  }));
  const search = useAnimatedStyle(() => ({
    top: interpolate(scrollY.value, [0, range], [insetTop + 150, insetTop + 8], Extrapolation.CLAMP),
    height: interpolate(scrollY.value, [0, range], [48, 44], Extrapolation.CLAMP),
    left: interpolate(scrollY.value, [0, range], [20, 16], Extrapolation.CLAMP),
    right: interpolate(scrollY.value, [0, range], [20, 16 + (action ? ACTION_W + 8 : 0)], Extrapolation.CLAMP),
    borderRadius: interpolate(scrollY.value, [0, range], [16, 14], Extrapolation.CLAMP),
  }));
  const actionStyle = useAnimatedStyle(() => ({
    top: interpolate(scrollY.value, [0, range], [insetTop + 12, insetTop + 8], Extrapolation.CLAMP),
    height: interpolate(scrollY.value, [0, range], [40, 44], Extrapolation.CLAMP),
    right: interpolate(scrollY.value, [0, range], [20, 16], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 10, overflow: 'hidden', backgroundColor: c.primary }, box]}>
      <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0, height: expanded + 120 }, pattern]}>
        <Image source={require('@/assets/images/pattern-3d.jpg')} contentFit="cover" contentPosition="top" style={{ width: '100%', height: '100%', opacity: 0.5 }} />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', left: 20, top: insetTop + 20 }, logo]} pointerEvents="none">
        <Logo height={24} />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: 20, right: 20, top: insetTop + 70, transformOrigin: 'left center' }, titleStyle]} pointerEvents="none">
        <Text variant="displayXl" color="#FFFFFF" accessibilityRole="header" style={{ fontSize: 27, lineHeight: 31 }}>
          {title}
        </Text>
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', backgroundColor: c.surface, overflow: 'hidden' }, search]}>
        <RNPressable onPress={onSearch} accessibilityRole="search" accessibilityLabel="Search" style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 }}>
          <Icon name="search" size={20} color="textBody" />
          <Text variant="body" color="textLightSecondary" numberOfLines={1} style={{ flex: 1 }}>
            {searchPlaceholder}
          </Text>
        </RNPressable>
      </Animated.View>

      {action ? (
        <Animated.View style={[{ position: 'absolute', width: ACTION_W }, actionStyle]}>
          <RNPressable
            onPress={action.onPress}
            accessibilityRole="button"
            style={({ pressed }) => ({ flex: 1, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.82 : 1 })}>
            <Text variant="body" weight={700} style={{ fontSize: 14 }}>
              {action.label}
            </Text>
          </RNPressable>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
