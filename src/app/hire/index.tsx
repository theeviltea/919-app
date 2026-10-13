import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { scrollTo, useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollapsingHeader, headerMetrics, Icon, Pressable, SegmentedTabs, TAB_BAR_SPACE, Text } from '@/components';
import { router } from 'expo-router';

import { initialsOf, useEmployer } from '@/data/employer';
import { candidates, countTalentFilters, emptyTalentFilters, talentSphereLabels, talentSphereOrder, type TalentSphere } from '@/data/talentPool';
import { TalentFiltersModal } from '@/features/hire/TalentFiltersModal';
import { RowHeader, TalentTileCard, VideoTileCard } from '@/features/hire/ui';
import { openVideo } from '@/features/media/viewer';
import { useTheme } from '@/theme';

type View2 = 'profiles' | 'videos';

const ROW = 10;
/** One row per field, all seven (Hospitality, F&B, Events, Modeling, Music, Beauty, Service). */
const profileRows = talentSphereOrder.map((k) => ({ key: k, title: talentSphereLabels[k], list: candidates.filter((x) => x.sphere === k) })).filter((r) => r.list.length);
const videoRows = profileRows.map((r) => ({ ...r, list: r.list.filter((x) => x.video) })).filter((r) => r.list.length);
const seeAll = (sphere: TalentSphere, tab?: 'videos') =>
  router.push({ pathname: '/hire/search', params: { f: JSON.stringify({ ...emptyTalentFilters, spheres: [sphere] }), ...(tab ? { tab } : {}) } });

/** Employer home — Find talent (TalentProfiles / TalentVideos): rows of candidates per field. */
export default function TalentHome() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<View2>('profiles');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { unreadNotifs: unread, info, plan } = useEmployer();

  const { expanded, range } = headerMetrics(insets.top, { titleLines: 1 });
  const ref = useAnimatedRef<Animated.ScrollView>();
  const y = useSharedValue(0);
  // Same as the seeker feed: never leave the header half-collapsed.
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

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <Animated.ScrollView ref={ref} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: expanded, paddingBottom: TAB_BAR_SPACE + 16, minHeight: '100%' }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <SegmentedTabs<View2>
            items={[
              { key: 'profiles', label: 'Profiles', icon: 'users' },
              { key: 'videos', label: 'Videos', icon: 'video' },
            ]}
            value={tab}
            onChange={setTab}
          />
        </View>

        {tab === 'profiles'
          ? profileRows.map((row) => (
              <View key={row.key} style={{ paddingTop: 16 }}>
                <RowHeader title={row.title} count={String(row.list.length)} onAll={() => seeAll(row.key)} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
                  {row.list.slice(0, ROW).map((t) => (
                    <TalentTileCard
                      key={t.id}
                      t={{ id: t.id, name: t.name.split(' ')[0], role: t.role.split(',')[0], city: t.city, photo: t.photo, premium: t.premium, placeholder: t.placeholder }}
                      onPress={() => router.push({ pathname: '/talent/[id]', params: { id: t.id } })}
                    />
                  ))}
                </ScrollView>
              </View>
            ))
          : videoRows.map((row) => (
              <View key={row.key} style={{ paddingTop: 16 }}>
                <RowHeader title={row.title} count={String(row.list.length)} onAll={() => seeAll(row.key, 'videos')} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
                  {row.list.slice(0, ROW).map((t) => (
                    <VideoTileCard
                      key={t.id}
                      v={{ id: t.id, name: t.name, city: t.city, photo: t.photo, duration: t.video!.duration, views: t.video!.views, tint: t.tint }}
                      onPress={() =>
                        openVideo({ poster: t.photo, duration: t.video!.duration, label: 'Video presentation', name: t.name, verified: t.verified, avatar: t.photo, subtitle: `${t.role} · ${t.city}` })
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            ))}
      </Animated.ScrollView>
      <CollapsingHeader
        scrollY={y}
        insetTop={insets.top}
        titleLines={1}
        title="Find talent"
        brand={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, minWidth: 0 }}>
            <View
              style={[
                { flexShrink: 1, minWidth: 0, height: 36, paddingLeft: 6, paddingRight: 12, borderRadius: 999, backgroundColor: c.onMediaPill, flexDirection: 'row', alignItems: 'center', gap: 8 },
                { backdropFilter: 'blur(8px)' } as object,
              ]}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="caption" weight={700} color="#18191C" style={{ fontSize: 10 }}>
                  {initialsOf(info.name)}
                </Text>
              </View>
              <Text variant="bodyS" weight={600} color="#FFFFFF" numberOfLines={1} style={{ fontSize: 13, flexShrink: 1 }}>
                {info.name}
              </Text>
            </View>
            {plan !== 'free' ? (
              <Pressable
                onPress={() => router.push('/company/subscription')}
                accessibilityRole="button"
                accessibilityLabel="Premium plan"
                style={{ height: 24, paddingLeft: 7, paddingRight: 9, borderRadius: 999, backgroundColor: c.labelOrangeText, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="star" size={12} color="#FFFFFF" />
                <Text variant="caption" weight={700} color="#FFFFFF" style={{ fontSize: 11 }}>
                  Premium
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        searchPlaceholder="Name, role or skill"
        onSearch={() => router.push('/hire/search')}
        onFilter={() => setFiltersOpen(true)}
        iconAction={{ icon: 'notification', label: unread ? `Notifications, ${unread} new` : 'Notifications', dot: unread > 0, onPress: () => router.push('/hire-notifications') }}
      />
      {/* Like the seeker feed: filters from the home open the search screen with the results, chips and count. */}
      <TalentFiltersModal
        key={String(filtersOpen)}
        visible={filtersOpen}
        value={emptyTalentFilters}
        source={candidates}
        onClose={() => setFiltersOpen(false)}
        onApply={(f) => {
          setFiltersOpen(false);
          if (countTalentFilters(f)) router.push({ pathname: '/hire/search', params: { f: JSON.stringify(f) } });
        }}
      />
    </View>
  );
}
