import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { scrollTo, useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, CollapsingHeader, EmptyState, headerMetrics, TAB_BAR_SPACE, Text } from '@/components';
import { spheres, vacancySpheres } from '@/data/dictionaries';
import { feedVacancies } from '@/data/mock';
import { useSeeker } from '@/data/seeker';
import type { Sphere } from '@/data/types';
import { applyFilters, countFilters, emptyFilters, FiltersSheet, type VacancyFilters } from '@/features/vacancies/FiltersSheet';
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
  const { profile, unreadNotifs } = useSeeker();
  const [quick, setQuick] = useState<'all' | 'urgent' | Sphere>('all');
  const [filters, setFilters] = useState<VacancyFilters>(emptyFilters);
  const [sheet, setSheet] = useState(false);
  const { expanded, range } = headerMetrics(insets.top, { titleLines: 1, eyebrow: true });
  const ref = useAnimatedRef<Animated.ScrollView>();
  const y = useSharedValue(0);
  const settle = (v: number) => {
    'worklet';
    if (v > 0 && v < range) scrollTo(ref, 0, v < range / 2 ? 0 : range, true);
  };
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      y.value = e.contentOffset.y;
    },
    onEndDrag: (e) => {
      if (Math.abs(e.velocity?.y ?? 0) < 0.2) settle(e.contentOffset.y);
    },
    onMomentumEnd: (e) => settle(e.contentOffset.y),
  });

  const list = useMemo(() => {
    const byQuick = feedVacancies.filter((v) => quick === 'all' || (quick === 'urgent' ? v.urgent : v.sphere === quick));
    return applyFilters(byQuick, filters).sort((a, b) => Number(b.urgent) - Number(a.urgent));
  }, [quick, filters]);
  const nFilters = countFilters(filters);

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <Animated.ScrollView ref={ref} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: expanded + 16, paddingBottom: TAB_BAR_SPACE + 16, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          <Chip label="All" selected={quick === 'all'} onPress={() => setQuick('all')} />
          <Chip label="Urgent" icon="fire" urgent selected={quick === 'urgent'} onPress={() => setQuick(quick === 'urgent' ? 'all' : 'urgent')} />
          {vacancySpheres.map((s) => (
            <Chip key={s} label={spheres[s]} selected={quick === s} onPress={() => setQuick(s)} />
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 18, marginBottom: 10 }}>
          <Text variant="displayM" accessibilityRole="header" style={{ flex: 1 }}>
            {quick === 'urgent' ? 'Urgent hiring' : 'Hiring today'}
          </Text>
          {nFilters ? (
            <Text variant="bodyS" weight={700} color="link" onPress={() => setFilters(emptyFilters)}>
              Clear {nFilters} filter{nFilters > 1 ? 's' : ''}
            </Text>
          ) : null}
        </View>
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {list.length ? (
            list.map((v) => <VacancyListCard key={v.id} v={v} onPress={() => router.push({ pathname: '/vacancy/[id]', params: { id: v.id } })} right={<SaveButton vacancyId={v.id} />} />)
          ) : (
            <EmptyState icon="search" title="No vacancies match" text="Try another sphere or clear the filters. New vacancies appear every hour." action={{ label: 'Clear filters', onPress: () => (setFilters(emptyFilters), setQuick('all')) }} />
          )}
        </View>
      </Animated.ScrollView>
      <CollapsingHeader
        scrollY={y}
        insetTop={insets.top}
        titleLines={1}
        eyebrowText={`${greeting()}, ${profile.firstName}`}
        title="Find your next shift"
        searchPlaceholder="Role, venue or area"
        onSearch={() => router.push({ pathname: '/guest/search', params: { tab: 'vacancies' } })}
        onFilter={() => setSheet(true)}
        iconAction={{ icon: 'notification', label: unreadNotifs ? `Notifications, ${unreadNotifs} new` : 'Notifications', dot: unreadNotifs > 0, onPress: () => router.push('/notifications') }}
      />
      <FiltersSheet
        key={String(sheet)}
        visible={sheet}
        value={filters}
        onClose={() => setSheet(false)}
        source={feedVacancies}
        onApply={(f) => (setFilters(f), setSheet(false))}
      />
    </View>
  );
}
