import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Chip, MaxFrame, PhotoTierBadge, Pressable, Text } from '@/components';
import { availableToday, talentSphereLabels, talentSphereOrder, type Candidate, type TalentSphere } from '@/data/talentPool';
import { useTheme } from '@/theme';

import { FlashTile, TodayPill } from './Available';

/** Candidate tile in the Today grid: photo 196 high with the plan badge and "Today · Evening". */
export function TodayCard({ t }: { t: Candidate }) {
  const { c } = useTheme();
  const ph = [c.avatar1, c.avatar2, c.avatar3, c.avatar4, c.avatar5][t.placeholder - 1];
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/talent/[id]', params: { id: t.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${t.name}, ${t.role}, ${t.city}, available today${t.today ? `, ${t.today}` : ''}`}
      style={{ flex: 1, backgroundColor: c.surface, borderRadius: 20, overflow: 'hidden', zIndex: 0 }}>
      <View style={{ height: 196, backgroundColor: ph }}>
        <Image source={t.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} transition={150} />
        <PhotoTierBadge tier={t.tier} />
        {t.today ? <TodayPill when={t.today} /> : null}
      </View>
      <View style={{ paddingHorizontal: 11, paddingTop: 9, paddingBottom: 11 }}>
        <Text variant="body" weight={600} numberOfLines={1} style={{ fontSize: 14 }}>
          {t.name}
        </Text>
        <Text variant="caption" weight={400} color="textBody" numberOfLines={1} style={{ marginTop: 2, fontSize: 12 }}>
          {t.role} · {t.city}
        </Text>
      </View>
      <MaxFrame frame={t.frame} />
    </Pressable>
  );
}

/** Two-column grid of TodayCards. */
export function TodayGrid({ list }: { list: Candidate[] }) {
  const rows = Array.from({ length: Math.ceil(list.length / 2) }, (_, i) => list.slice(i * 2, i * 2 + 2));
  return (
    <View style={{ gap: 10 }}>
      {rows.map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
          {r.map((t) => (
            <TodayCard key={t.id} t={t} />
          ))}
          {r.length === 1 ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
    </View>
  );
}

/** TalentAvailable — the Today tab of Find talent: who can start work today, by field. */
export function TodayTalent() {
  const { c } = useTheme();
  const [sphere, setSphere] = useState<TalentSphere | 'all'>('all');
  const all = availableToday();
  const count = (s: TalentSphere) => all.filter((x) => x.sphere === s).length;
  const list = sphere === 'all' ? all : all.filter((x) => x.sphere === sphere);
  return (
    <View style={{ paddingTop: 12, gap: 12 }}>
      <View style={{ marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.attentionBack }}>
        <FlashTile size={32} />
        <Text variant="bodyS" style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>
          People who can start work{' '}
          <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
            today
          </Text>
          . They turn this on for 24 hours.
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
        <Chip label="All" count={all.length} selected={sphere === 'all'} onPress={() => setSphere('all')} />
        {talentSphereOrder
          .filter((s) => count(s))
          .map((s) => (
            <Chip key={s} label={talentSphereLabels[s]} count={count(s)} selected={sphere === s} onPress={() => setSphere(s)} />
          ))}
      </ScrollView>
      <View style={{ paddingHorizontal: 20 }}>
        {list.length ? (
          <TodayGrid list={list} />
        ) : (
          <Text variant="body" color="textBody" align="center" style={{ paddingVertical: 32, fontSize: 14 }}>
            No one in this field is available today yet.
          </Text>
        )}
      </View>
    </View>
  );
}
