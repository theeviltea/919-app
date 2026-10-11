import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, PatternHeader, Pressable, SegmentedTabs, TAB_BAR_SPACE, Text } from '@/components';
import { company, talentRows, videoRows } from '@/data/employer';
import { GlassButton, RowHeader, TalentTileCard, useSoon, VideoTileCard } from '@/features/hire/ui';
import { openVideo } from '@/features/media/viewer';
import { useTheme } from '@/theme';

type View2 = 'profiles' | 'videos';

/** Employer home — Find talent (TalentProfiles / TalentVideos): rows of candidates per field. */
export default function TalentHome() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const soon = useSoon();
  const [tab, setTab] = useState<View2>('profiles');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.back }} contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + 16 }}>
      <PatternHeader style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 22, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={[{ flexShrink: 1, minWidth: 0, height: 36, paddingLeft: 6, paddingRight: 12, borderRadius: 999, backgroundColor: c.onMediaPill, flexDirection: 'row', alignItems: 'center', gap: 8 }, { backdropFilter: 'blur(8px)' } as object]}>
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
          <View style={{ flex: 1 }} />
          <GlassButton icon="notification" label="Notifications, new" dot onPress={() => soon('Notifications')} />
        </View>
        <Text variant="displayL" color="#FFFFFF" accessibilityRole="header" style={{ fontSize: 25, lineHeight: 30 }}>
          Find talent
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => soon('Talent search')}
            accessibilityRole="search"
            accessibilityLabel="Search talent"
            style={{ flex: 1, height: 44, borderRadius: 14, backgroundColor: c.surface, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="search" size={20} color="textBody" />
            <Text variant="body" color="textLightSecondary" style={{ fontSize: 15 }}>
              Name, role or skill
            </Text>
          </Pressable>
          <Pressable
            onPress={() => soon('Talent filters')}
            accessibilityRole="button"
            accessibilityLabel="Filters"
            style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="filter" size={20} color="#18191C" />
          </Pressable>
        </View>
      </PatternHeader>

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
                    onPress={() => openVideo({ poster: v.photo, duration: v.duration, label: 'Video presentation', name: v.name, verified: true, avatar: v.photo, subtitle: `${row.title} · ${v.city}` })}
                  />
                ))}
              </ScrollView>
            </View>
          ))}
    </ScrollView>
  );
}
