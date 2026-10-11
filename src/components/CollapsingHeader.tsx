import { Image } from 'expo-image';
import { Pressable as RNPressable, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { useTheme } from '@/theme';

import { Logo } from './Brand';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Layout = { titleLines?: number; eyebrow?: boolean };

/** Geometry of the collapsing header, shared with the screen for content padding and snapping. */
export function headerMetrics(insetTop: number, layout: Layout = {}) {
  const titleH = (layout.titleLines ?? 2) * 31 + (layout.eyebrow ? 22 : 0);
  const searchTop = insetTop + 70 + titleH + 18;
  const expanded = searchTop + 48 + 24;
  const collapsed = insetTop + 64;
  return { expanded, collapsed, range: expanded - collapsed, searchTop };
}

type Props = Layout & {
  scrollY: SharedValue<number>;
  insetTop: number;
  title: string;
  /** Small line above the title, e.g. "Good evening, Mia". */
  eyebrowText?: string;
  searchPlaceholder: string;
  onSearch: () => void;
  /** Text action (Sign in) — moves from the logo row into the search row as the header collapses. */
  action?: { label: string; onPress: () => void };
  /** Icon action (notifications) — same travel as `action`. */
  iconAction?: { icon: IconName; label: string; onPress: () => void; dot?: boolean };
  /** Yellow filter button next to the search bar. */
  onFilter?: () => void;
};

const ACTION_W = 84;
const BTN = 44;

/**
 * Brand header that minimises with scroll: the logo and title fade and lift away, the search bar rides up
 * into one compact row with the actions, the bottom radius tightens. Overscroll stretches the pattern.
 */
export function CollapsingHeader(props: Props) {
  const { scrollY, insetTop, title, eyebrowText, searchPlaceholder, onSearch, action, iconAction, onFilter } = props;
  const { c } = useTheme();
  const { expanded, collapsed, range, searchTop } = headerMetrics(insetTop, { titleLines: props.titleLines, eyebrow: !!eyebrowText });
  const tail = action ? ACTION_W + 8 : iconAction ? BTN + 8 : 0; // right-side space taken in the compact row
  const filterW = onFilter ? BTN + 8 : 0;

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
  const rowTop = (from: number) => interpolate(scrollY.value, [0, range], [from, insetTop + 10], Extrapolation.CLAMP);
  const search = useAnimatedStyle(() => ({
    top: interpolate(scrollY.value, [0, range], [searchTop, insetTop + 10], Extrapolation.CLAMP),
    height: interpolate(scrollY.value, [0, range], [48, 44], Extrapolation.CLAMP),
    left: interpolate(scrollY.value, [0, range], [20, 16], Extrapolation.CLAMP),
    right: interpolate(scrollY.value, [0, range], [20 + filterW, 16 + filterW + tail], Extrapolation.CLAMP),
    borderRadius: interpolate(scrollY.value, [0, range], [16, 14], Extrapolation.CLAMP),
  }));
  const filter = useAnimatedStyle(() => ({
    top: interpolate(scrollY.value, [0, range], [searchTop + 2, insetTop + 10], Extrapolation.CLAMP),
    right: interpolate(scrollY.value, [0, range], [20, 16 + tail], Extrapolation.CLAMP),
  }));
  const actionStyle = useAnimatedStyle(() => ({
    top: rowTop(insetTop + 12),
    height: interpolate(scrollY.value, [0, range], [action ? 40 : BTN, BTN], Extrapolation.CLAMP),
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
        {eyebrowText ? (
          <Text variant="body" weight={500} color="rgba(255,255,255,0.88)" style={{ fontSize: 15, lineHeight: 22 }}>
            {eyebrowText}
          </Text>
        ) : null}
        <Text variant="displayXl" color="#FFFFFF" accessibilityRole="header" style={{ fontSize: eyebrowText ? 24 : 27, lineHeight: 31 }}>
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

      {onFilter ? (
        <Animated.View style={[{ position: 'absolute', width: BTN, height: BTN }, filter]}>
          <RNPressable
            onPress={onFilter}
            accessibilityRole="button"
            accessibilityLabel="Filters"
            style={({ pressed }) => ({ flex: 1, borderRadius: 14, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.82 : 1 })}>
            <Icon name="filter" size={20} color="onUrgent" />
          </RNPressable>
        </Animated.View>
      ) : null}

      {action || iconAction ? (
        <Animated.View style={[{ position: 'absolute', width: action ? ACTION_W : BTN }, actionStyle]}>
          <RNPressable
            onPress={action?.onPress ?? iconAction?.onPress}
            accessibilityRole="button"
            accessibilityLabel={action?.label ?? iconAction?.label}
            style={({ pressed }) => ({
              flex: 1,
              borderRadius: 14,
              backgroundColor: action ? c.surface : 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.82 : 1,
            })}>
            {action ? (
              <Text variant="body" weight={700} style={{ fontSize: 14 }}>
                {action.label}
              </Text>
            ) : iconAction ? (
              <>
                <Icon name={iconAction.icon} size={22} color="#FFFFFF" />
                {iconAction.dot ? <View style={{ position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: 5, backgroundColor: c.urgent, borderWidth: 1.5, borderColor: c.primary }} /> : null}
              </>
            ) : null}
          </RNPressable>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
