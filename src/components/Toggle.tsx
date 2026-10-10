import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import { useTheme } from '@/theme';

import { Pressable } from './Pressable';

/** Toggle 44×26 — for settings that apply immediately. Knob is white in both themes. */
export function Toggle({ value, onValueChange, accessibilityLabel }: { value: boolean; onValueChange: (v: boolean) => void; accessibilityLabel?: string }) {
  const { c } = useTheme();
  const x = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(x, { toValue: value ? 1 : 0, duration: 160, useNativeDriver: false }).start();
  }, [value, x]);
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      style={{ width: 44, height: 26, borderRadius: 999, backgroundColor: value ? c.primary : c.toggleOff, justifyContent: 'center' }}>
      <Animated.View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(14,26,43,0.2)',
          transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [3, 21] }) }],
        }}
      />
    </Pressable>
  );
}
