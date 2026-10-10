import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, type Colors } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Kind = 'brand' | 'neutral' | 'paid';
type ToastOpts = { text: string; kind?: Kind; icon?: IconName; aboveTabBar?: boolean };

const Ctx = createContext<(o: ToastOpts) => void>(() => {});
export const useToast = () => useContext(Ctx);

/** Toast — `inverse` plate, icon in a circle, 1–2 lines, auto-hides after 3 s. One at a time. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastOpts | null>(null);
  const a = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (o: ToastOpts) => {
      if (timer.current) clearTimeout(timer.current);
      setToast(o);
      a.setValue(0);
      Animated.timing(a, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(a, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setToast(null));
      }, 3000);
    },
    [a],
  );

  const kind = toast?.kind ?? 'brand';
  const circle: Record<Kind, [keyof Colors, keyof Colors]> = {
    brand: ['primary', 'ctaButtonText'],
    neutral: ['onInverse', 'inverse'],
    paid: ['urgent', 'onUrgent'],
  };
  const [bg, fg] = circle[kind];

  return (
    <Ctx.Provider value={show}>
      {children}
      {toast ? (
        <Animated.View
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: (toast.aboveTabBar ? 104 : 34) + (insets.bottom ? 0 : 0),
            opacity: a,
            transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 16,
            backgroundColor: c.inverse,
            boxShadow: '0 10px 30px rgba(14,26,43,0.2)',
            maxWidth: 520,
            alignSelf: 'center',
          }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c[bg], alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={toast.icon ?? (kind === 'paid' ? 'fire' : 'check')} size={16} color={fg} />
          </View>
          <Text variant="body" weight={600} color="onInverse" numberOfLines={2} style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
            {toast.text}
          </Text>
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  );
}
