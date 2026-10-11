import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme';

import { Text } from './Text';

export const PAGE_SIZE = 20;

/** 24 px ring spinner: muted track, brand arc. */
export function Spinner({ size = 24 }: { size?: number }) {
  const { c } = useTheme();
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1, false);
  }, [r]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  const sw = size / 8;
  const rad = (size - sw) / 2;
  const len = 2 * Math.PI * rad;
  return (
    <Animated.View style={[{ width: size, height: size }, style]} accessibilityRole="progressbar" accessibilityLabel="Loading">
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={rad} stroke={c.stroke} strokeWidth={sw} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={rad} stroke={c.primary} strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={`${len * 0.28} ${len}`} />
      </Svg>
    </Animated.View>
  );
}

/** List footer while the next page loads, and the end-of-list line once everything is shown. */
export function LoadMoreFooter({ loading, done, total, noun }: { loading: boolean; done: boolean; total: number; noun: string }) {
  const { c } = useTheme();
  if (!loading && !done) return <View style={{ height: 64 }} />;
  if (loading)
    return (
      <View style={{ height: 64, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, paddingHorizontal: 16, borderRadius: 999, backgroundColor: c.surface, boxShadow: '0 4px 14px rgba(14,26,43,0.08)' }}>
          <Spinner size={20} />
          <Text variant="bodyS" weight={600} color="textBody" style={{ fontSize: 13 }}>
            Loading more {noun}…
          </Text>
        </View>
      </View>
    );
  return (
    <View style={{ height: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
      <Text variant="bodyS" color="textLightSecondary" style={{ fontSize: 13 }}>
        You’ve seen all {total} {noun}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
    </View>
  );
}

/**
 * Client-side paging for the prototype: shows 20, then 20 more each time the list end is reached
 * (with a short fake network delay). `resetKey` — filters / query: when it changes, back to page 1.
 */
export function usePaged(total: number, resetKey: string, delay = 700) {
  const [state, setState] = useState({ key: resetKey, n: PAGE_SIZE, loading: false });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  const fresh = state.key === resetKey;
  const n = fresh ? state.n : PAGE_SIZE;
  const loading = fresh && state.loading;
  const done = n >= total;
  const loadMore = useCallback(() => {
    if (loading || done) return;
    setState({ key: resetKey, n, loading: true });
    timer.current = setTimeout(() => setState((s) => ({ key: s.key, n: s.n + PAGE_SIZE, loading: false })), delay);
  }, [loading, done, resetKey, n, delay]);
  return { count: Math.min(n, total), loading, done: done && total > PAGE_SIZE, loadMore };
}

// ---------- "end of the scroll reached" from a screen's ScrollView down to the list inside it.

type Hub = { subscribe: (cb: () => void) => () => void };
const EndCtx = createContext<Hub | null>(null);

/** Screen side: wrap the content in <EndReachedProvider value={hub}> and call notify() near the bottom. */
export function useEndReachedHub() {
  const subs = useRef(new Set<() => void>());
  const hub = useMemo<Hub>(
    () => ({
      subscribe: (cb) => {
        subs.current.add(cb);
        return () => void subs.current.delete(cb);
      },
    }),
    [],
  );
  const notify = useCallback(() => subs.current.forEach((f) => f()), []);
  return { hub, notify };
}
export function EndReachedProvider({ value, children }: { value: Hub; children: ReactNode }) {
  return <EndCtx.Provider value={value}>{children}</EndCtx.Provider>;
}
/** List side. */
export function useOnEndReached(cb: () => void) {
  const hub = useContext(EndCtx);
  const ref = useRef(cb);
  useEffect(() => {
    ref.current = cb;
  });
  useEffect(() => hub?.subscribe(() => ref.current()), [hub]);
}

/** Distance from the bottom that counts as "the end" (px). */
export const END_THRESHOLD = 360;
