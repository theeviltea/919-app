import { useRef, useState } from 'react';
import { View, type GestureResponderEvent } from 'react-native';

import { Text } from '@/components';
import { useTheme } from '@/theme';

type Props = { min: number; max: number; step: number; low: number; high: number; onChange: (low: number, high: number) => void; format: (v: number, isMax: boolean) => string };

/** Two-thumb range slider. Drag anywhere on the track: the nearest thumb follows. */
export function RangeSlider({ min, max, step, low, high, onChange, format }: Props) {
  const { c } = useTheme();
  const track = useRef<View>(null);
  const box = useRef({ x: 0, w: 1 });
  const active = useRef<'low' | 'high'>('low');
  const [w, setW] = useState(1);
  const pct = (v: number) => (v - min) / (max - min);

  const valueAt = (pageX: number) => {
    const r = Math.min(1, Math.max(0, (pageX - box.current.x) / box.current.w));
    return Math.round((min + r * (max - min)) / step) * step;
  };
  const move = (e: GestureResponderEvent) => {
    const v = valueAt(e.nativeEvent.pageX);
    if (active.current === 'low') onChange(Math.min(v, high - step), high);
    else onChange(low, Math.max(v, low + step));
  };
  const grant = (e: GestureResponderEvent) => {
    const v = valueAt(e.nativeEvent.pageX);
    active.current = v <= low || (v < high && v - low <= high - v) ? 'low' : 'high';
  };

  const thumb = (v: number) => (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: pct(v) * w - 13, top: 2, width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: c.stroke, boxShadow: '0 2px 6px rgba(14,26,43,0.18)' }}
    />
  );

  return (
    <View style={{ paddingHorizontal: 10 }}>
      <View
        ref={track}
        onLayout={(e) => {
          setW(e.nativeEvent.layout.width);
          track.current?.measureInWindow((x, _y, width) => (box.current = { x, w: width || 1 }));
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => (grant(e), move(e))}
        onResponderMove={move}
        accessibilityRole="adjustable"
        accessibilityLabel={`Pay from ${format(low, false)} to ${format(high, true)}`}
        style={{ height: 30, justifyContent: 'center' }}>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: c.stroke }} />
        <View style={{ position: 'absolute', left: pct(low) * w, width: (pct(high) - pct(low)) * w, height: 4, borderRadius: 2, backgroundColor: c.primary }} />
        {thumb(low)}
        {thumb(high)}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text variant="caption" weight={400} color="textBody">
          AED {format(min, false)}
        </Text>
        <Text variant="caption" weight={400} color="textBody">
          AED {format(max, true)}
        </Text>
      </View>
    </View>
  );
}
