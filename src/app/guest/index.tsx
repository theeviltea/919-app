import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { runOnJS, scrollTo, useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollapsingHeader, END_THRESHOLD, EndReachedProvider, headerMetrics, useEndReachedHub } from '@/components';
import { GuestBrowse, type GuestTab } from '@/features/vacancies/GuestBrowse';
import { useTheme } from '@/theme';

/** Guest zone — public vacancies and closed talent list. Sign in only in the header and on key actions. */
export default function GuestHome() {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const params = useLocalSearchParams<{ tab?: GuestTab }>();
  const [tab, setTab] = useState<GuestTab>(params.tab === 'talent' ? 'talent' : 'vacancies');
  const { expanded, range } = headerMetrics(insets.top);
  const { hub, notify } = useEndReachedHub();
  const ref = useAnimatedRef<Animated.ScrollView>();
  const y = useSharedValue(0);

  // Never leave the header half-collapsed: settle to open or closed when the finger lifts.
  const settle = (v: number) => {
    'worklet';
    if (v > 0 && v < range) scrollTo(ref, 0, v < range / 2 ? 0 : range, true);
  };
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      y.value = e.contentOffset.y;
      if (e.contentSize.height - e.contentOffset.y - e.layoutMeasurement.height < END_THRESHOLD) runOnJS(notify)();
    },
    onEndDrag: (e) => {
      if (Math.abs(e.velocity?.y ?? 0) < 0.2) settle(e.contentOffset.y);
    },
    onMomentumEnd: (e) => settle(e.contentOffset.y),
  });

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <Animated.ScrollView
        ref={ref}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: expanded + 18, minHeight: '100%', width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <EndReachedProvider value={hub}>
          <GuestBrowse tab={tab} onTab={setTab} />
        </EndReachedProvider>
      </Animated.ScrollView>
      <CollapsingHeader
        scrollY={y}
        insetTop={insets.top}
        title={'Find work.\nFind people.'}
        searchPlaceholder={tab === 'vacancies' ? 'Role, venue or area' : 'Name, role or skill'}
        onSearch={() => router.push({ pathname: '/guest/search', params: { tab } })}
        action={{ label: 'Sign in', onPress: () => router.push('/auth/sign-in') }}
      />
    </View>
  );
}
