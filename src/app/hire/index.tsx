import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { scrollTo, useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollapsingHeader, headerMetrics, Icon, Pressable, SegmentedTabs, TAB_BAR_SPACE, Text } from '@/components';
import { company, talentRows, videoRows } from '@/data/employer';
import { RowHeader, TalentTileCard, useSoon, VideoTileCard } from '@/features/hire/ui';
import { openVideo } from '@/features/media/viewer';
import { useTheme } from '@/theme';

type View2 = 'profiles' | 'videos';

/** Employer home — Find talent (TalentProfiles / TalentVideos): rows of candidates per field. */
export default function TalentHome() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const soon = useSoon();
  const [tab, setTab] = useState<View2>('profiles');

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
          ? talentRows.map((row) => (
              <View key={row.key} style={{ paddingTop: 16 }}>
                <RowHeader title={row.title} count={row.count} onAll={() => soon(`${row.title} category`)} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
                  {row.people.map((t) => (
                    <TalentTileCard key={t.id} t={t} onPress={() => soon('Candidate profile')} />
                  ))}
                </ScrollView>
              </View>
            ))
          : videoRows.map((row) => (
              <View key={row.key} style={{ paddingTop: 16 }}>
                <RowHeader title={row.title} count={row.count} onAll={() => soon(`${row.title} videos`)} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
                  {row.videos.map((v) => (
                    <VideoTileCard
                      key={v.id}
                      v={v}
                      onPress={() =>
                        openVideo({ poster: v.photo, duration: v.duration, label: 'Video presentation', name: v.name, verified: true, avatar: v.photo, subtitle: `${row.title} · ${v.city}` })
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
                  {company.initials}
                </Text>
              </View>
              <Text variant="bodyS" weight={600} color="#FFFFFF" numberOfLines={1} style={{ fontSize: 13, flexShrink: 1 }}>
                {company.name}
              </Text>
            </View>
            {company.plan === 'premium' ? (
              <Pressable
                onPress={() => soon('Subscription')}
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
        onSearch={() => soon('Talent search')}
        onFilter={() => soon('Talent filters')}
        iconAction={{ icon: 'notification', label: 'Notifications, new', dot: true, onPress: () => soon('Notifications') }}
      />
    </View>
  );
}
