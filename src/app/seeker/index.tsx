import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { runOnJS, scrollTo, useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, CollapsingHeader, EmptyState, END_THRESHOLD, headerMetrics, LoadMoreFooter, TAB_BAR_SPACE, Text, usePaged } from '@/components';
import { spheres, vacancySpheres } from '@/data/dictionaries';
import { feedVacancies } from '@/data/mock';
import { useSeeker } from '@/data/seeker';
import { AvailCard } from '@/features/availability/Available';
import type { Sphere } from '@/data/types';
import { SeekFeedSkeleton } from '@/features/skeletons/SeekFeedSkeleton';
import { useFirstLoad } from '@/features/skeletons/useFirstLoad';
import { countFilters, emptyFilters, FiltersSheet } from '@/features/vacancies/FiltersSheet';
import { SaveButton } from '@/features/vacancies/SaveButton';
import { VacancyListCard } from '@/features/vacancies/VacancyListCard';
import { useTheme } from '@/theme';

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

/** Seeker home — vacancy feed. Urgent vacancies are pinned to the top (product rules §5). */
export default function SeekerHome() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, unreadNotifs, availEligible } = useSeeker();
  const [quick, setQuick] = useState<'all' | 'urgent' | Sphere>('all');
  const [sheet, setSheet] = useState(false);
  const loading = useFirstLoad('seeker-feed');
  const { expanded, range } = headerMetrics(insets.top, { titleLines: 1, eyebrow: true });
  const list = useMemo(() => {
    const byQuick = feedVacancies.filter((v) => quick === 'all' || (quick === 'urgent' ? v.urgent : v.sphere === quick));
    return byQuick.sort((a, b) => Number(b.urgent) - Number(a.urgent));
  }, [quick]);
  const paged = usePaged(list.length, quick);
  // Stable entry point for the UI-thread scroll handler; always calls the latest loadMore.
  const loadRef = useRef(paged.loadMore);
  useEffect(() => {
    loadRef.current = paged.loadMore;
  });
  const loadMore = useCallback(() => loadRef.current(), []);
  const ref = useAnimatedRef<Animated.ScrollView>();
  const y = useSharedValue(0);
  const settle = (v: number) => {
    'worklet';
    if (v > 0 && v < range) scrollTo(ref, 0, v < range / 2 ? 0 : range, true);
  };
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      y.value = e.contentOffset.y;
      if (e.contentSize.height - e.contentOffset.y - e.layoutMeasurement.height < END_THRESHOLD) runOnJS(loadMore)();
    },
    onEndDrag: (e) => {
      if (Math.abs(e.velocity?.y ?? 0) < 0.2) settle(e.contentOffset.y);
    },
    onMomentumEnd: (e) => settle(e.contentOffset.y),
  });

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <Animated.ScrollView ref={ref} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: expanded + 16, paddingBottom: TAB_BAR_SPACE + 16, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        {availEligible ? (
          <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
            <AvailCard onOpen={() => router.push('/seeker/profile')} />
          </View>
        ) : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          <Chip label="All" selected={quick === 'all'} onPress={() => setQuick('all')} />
          <Chip label="Urgent" icon="fire" urgent selected={quick === 'urgent'} onPress={() => setQuick(quick === 'urgent' ? 'all' : 'urgent')} />
          {vacancySpheres.map((s) => (
            <Chip key={s} label={spheres[s]} selected={quick === s} onPress={() => setQuick(s)} />
          ))}
        </ScrollView>
        {loading ? (
          <View style={{ marginTop: 14 }}>
            <SeekFeedSkeleton />
          </View>
        ) : (
          <>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 18, marginBottom: 10 }}>
          <Text variant="displayM" accessibilityRole="header" style={{ flex: 1 }}>
            {quick === 'urgent' ? 'Urgent hiring' : 'Hiring today'}
          </Text>
        </View>
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {list.length ? (
            list.slice(0, paged.count).map((v) => <VacancyListCard key={v.id} v={v} onPress={() => router.push({ pathname: '/vacancy/[id]', params: { id: v.id } })} right={<SaveButton vacancyId={v.id} />} />)
          ) : (
            <EmptyState icon="search" title="No vacancies match" text="Try another sphere. New vacancies appear every hour." action={{ label: 'Show all', onPress: () => setQuick('all') }} />
          )}
          {list.length ? <LoadMoreFooter loading={paged.loading} done={paged.done} total={list.length} noun="vacancies" /> : null}
        </View>
          </>
        )}
      </Animated.ScrollView>
      <CollapsingHeader
        scrollY={y}
        insetTop={insets.top}
        titleLines={1}
        eyebrowText={`${greeting()}, ${profile.firstName}`}
        title="Find your next job"
        searchPlaceholder="Role, venue or area"
        onSearch={() => router.push('/seeker/search')}
        onFilter={() => setSheet(true)}
        iconAction={{ icon: 'notification', label: unreadNotifs ? `Notifications, ${unreadNotifs} new` : 'Notifications', dot: unreadNotifs > 0, onPress: () => router.push('/notifications') }}
      />
      <FiltersSheet
        key={String(sheet)}
        visible={sheet}
        value={emptyFilters}
        onClose={() => setSheet(false)}
        source={feedVacancies}
        // Results live on the search screen (SeekSearchResults): chips, count, Clear — the feed stays unfiltered.
        onApply={(f) => {
          setSheet(false);
          if (countFilters(f)) router.push({ pathname: '/seeker/search', params: { f: JSON.stringify(f) } });
        }}
      />
    </View>
  );
}
