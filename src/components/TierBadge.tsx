import { useId, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { frameStops, type FrameStyle, type Tier } from '@/data/tiers';
import { useTheme } from '@/theme';

const STAR = 'M12 4.6l2.2 4.5 4.9.7-3.6 3.5.9 4.9L12 15.9l-4.4 2.3.9-4.9-3.6-3.5 4.9-.7L12 4.6Z';

/**
 * Seeker plan badge (design system: TierBadge): a white star in a circle — blue `primary` for Premium,
 * gold gradient for Max, nothing for Free. 24 on a card photo, 22 next to a profile name, 18 in lists
 * and chips, 16 in dense rows. `onPhoto` adds the white ring and soft shadow used over images.
 */
export function TierBadge({ tier, size = 18, onPhoto, ring, style }: { tier?: Tier; size?: number; onPhoto?: boolean; ring?: string; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  // Unique per instance: on web, screens kept in the stack hold their own <defs>; a shared id would point at a hidden one.
  const id = `tier-${useId().replace(/:/g, '')}`;
  if (!tier || tier === 'free') return null;
  const r = size / 2;
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={tier === 'max' ? 'Max' : 'Premium'}
      style={[
        { width: size, height: size, borderRadius: r, flexShrink: 0 },
        onPhoto ? ({ boxShadow: `0 0 0 2px ${ring ?? '#FFFFFF'}, 0 2px 6px rgba(14,26,43,0.25)` } as object) : null,
        ring && !onPhoto ? ({ boxShadow: `0 0 0 2px ${ring}` } as object) : null,
        style,
      ]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={tier === 'max' ? '#FFD84D' : c.primary} />
            <Stop offset="1" stopColor={tier === 'max' ? '#FF9F1A' : c.primary} />
          </LinearGradient>
        </Defs>
        <Circle cx={r} cy={r} r={r} fill={`url(#${id})`} />
        <Path d={STAR} fill="#FFFFFF" transform={`translate(${size * 0.19} ${size * 0.19}) scale(${(size * 0.62) / 24})`} />
      </Svg>
    </View>
  );
}

/** Badge position on a card photo: top-left, 8 from the edges (video tiles: 10). */
export function PhotoTierBadge({ tier, inset = 8 }: { tier?: Tier; inset?: number }) {
  if (!tier || tier === 'free') return null;
  return <TierBadge tier={tier} size={24} onPhoto style={{ position: 'absolute', left: inset, top: inset, zIndex: 2 }} />;
}

/**
 * Max frame (design system: ProfileCard): a 3px gradient outline drawn over the whole card, inside its
 * rounded corners. The card itself sets `overflow: hidden` and `isolation` so the frame never paints
 * over headers or the tab bar.
 */
export function MaxFrame({ frame, radius = 20, width = 3 }: { frame?: FrameStyle; radius?: number; width?: number }) {
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const id = `frame-${useId().replace(/:/g, '')}`;
  if (!frame) return null;
  const stops = frameStops[frame];
  return (
    <View pointerEvents="none" onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 3 }}>
      {box ? (
        <Svg width={box.w} height={box.h}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              {stops.map((s, i) => (
                <Stop key={i} offset={i / (stops.length - 1)} stopColor={s} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect x={width / 2} y={width / 2} width={box.w - width} height={box.h - width} rx={radius - width / 2} ry={radius - width / 2} fill="none" stroke={`url(#${id})`} strokeWidth={width} />
        </Svg>
      ) : null}
    </View>
  );
}

/** Round avatar with an optional Max frame ring (profile headers, People Max strip). */
export function FramedAvatar({ frame, size, ring = 5, gap = 3, children, bg }: { frame?: FrameStyle; size: number; ring?: number; gap?: number; children: React.ReactNode; bg: string }) {
  const stops = frame ? frameStops[frame] : null;
  const id = `ring-${useId().replace(/:/g, '')}`;
  return (
    <View style={{ width: size, height: size }}>
      {stops ? (
        <Svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              {stops.map((s, i) => (
                <Stop key={i} offset={i / (stops.length - 1)} stopColor={s} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={size} height={size} rx={size / 2} fill={`url(#${id})`} />
        </Svg>
      ) : null}
      <View
        style={{
          position: 'absolute',
          left: stops ? ring : 0,
          top: stops ? ring : 0,
          right: stops ? ring : 0,
          bottom: stops ? ring : 0,
          borderRadius: size,
          borderWidth: gap,
          borderColor: bg,
          overflow: 'hidden',
          backgroundColor: bg,
        }}>
        {children}
      </View>
    </View>
  );
}
