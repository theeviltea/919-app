import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, FramedAvatar, Icon, Logo, MaxFrame, PatternHeader, Pressable, TAB_BAR_SPACE, Text, TierBadge, type IconName } from '@/components';
import { FULL_NAMES } from '@/data/candidateProfile';
import { completeness, useSeeker } from '@/data/seeker';
import { candidates, talentSphereLabels, talentSphereOrder, type Candidate, type TalentSphere } from '@/data/talentPool';
import { tierRank } from '@/data/tiers';
import { TalentCard } from '@/features/talent/TalentCard';
import { useTheme } from '@/theme';

const byName = (n: string) => candidates.find((c) => c.name === n)!;
// The seeker's own field is Hospitality in the demo; the top list is the most complete profiles there.
const TOP = ['Layla H.', 'Nadia R.', 'Sara M.', 'Olivia G.'].map(byName);
const MAX_STRIP = ['Karim A.', 'Lina M.', 'Omar S.', 'Zara K.', 'Leo P.', 'Ali R.', 'Yusuf N.'].map(byName);
const FULL = FULL_NAMES;
const META: Record<string, [number, string]> = { 'Layla H.': [12, 'EN · AR'], 'Nadia R.': [10, 'EN · FR · AR'], 'Sara M.': [9, 'EN · PT'], 'Olivia G.': [11, 'EN · RU'] };
const open = (c: Candidate) => router.push({ pathname: '/people/[id]', params: { id: c.id } });

function TopCard({ c: x, rank }: { c: Candidate; rank: number }) {
  const { c } = useTheme();
  const [photos, langs] = META[x.name] ?? [6, 'EN'];
  return (
    <Pressable onPress={() => open(x)} accessibilityRole="button" accessibilityLabel={`Number ${rank}: ${FULL[x.name] ?? x.name}, ${x.role}`} style={{ width: 196, paddingLeft: 26 }}>
      <Text
        variant="displayL"
        style={
          {
            position: 'absolute',
            left: -2,
            bottom: 54,
            fontSize: 96,
            lineHeight: 96,
            color: 'transparent',
            WebkitTextStroke: `2px ${c.control}`,
            letterSpacing: -6,
          } as object
        }>
        {rank}
      </Text>
      <View style={{ height: 248, borderRadius: 24, overflow: 'hidden', backgroundColor: c.backDarker, zIndex: 0, boxShadow: '0 14px 30px rgba(14,26,43,0.14)' } as object}>
        <Image source={x.photo} contentFit="cover" contentPosition={{ top: '20%' }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
        <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, experimental_backgroundImage: 'linear-gradient(180deg, rgba(14,26,43,0) 45%, rgba(14,26,43,0.82) 100%)' } as object} />
        <TierBadge tier={x.tier} size={24} onPhoto style={{ position: 'absolute', left: 10, top: 11, zIndex: 2 }} />
        <View style={{ position: 'absolute', left: x.tier !== 'free' ? 42 : 10, top: 10, height: 26, paddingHorizontal: 9, borderRadius: 999, backgroundColor: '#FFD43B', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="check" size={12} color="#18191C" />
          <Text variant="caption" weight={700} color="#18191C" style={{ fontSize: 12 }}>
            100%
          </Text>
        </View>
        {x.video ? (
          <View style={{ position: 'absolute', right: 10, top: 10, height: 26, paddingHorizontal: 8, borderRadius: 999, backgroundColor: 'rgba(14,26,43,0.55)', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="play-filled" size={10} color="#FFFFFF" />
            <Text variant="caption" weight={600} color="#FFFFFF" style={{ fontSize: 11 }}>
              {x.video.duration}
            </Text>
          </View>
        ) : null}
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
          <Text variant="bodyL" weight={700} color="#FFFFFF" numberOfLines={1} style={{ fontSize: 16 }}>
            {FULL[x.name] ?? x.name}
          </Text>
          <Text variant="caption" weight={400} color="rgba(255,255,255,0.86)" style={{ marginTop: 2, fontSize: 12 }}>
            {x.role} · {x.city}
          </Text>
          <View style={{ marginTop: 8, flexDirection: 'row', gap: 10 }}>
            {(
              [
                ['camera', String(photos)],
                ['globe', langs],
              ] as [IconName, string][]
            ).map(([i, t]) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Icon name={i} size={13} color="rgba(255,255,255,0.9)" />
                <Text variant="caption" weight={600} color="rgba(255,255,255,0.9)" style={{ fontSize: 11 }}>
                  {t}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <MaxFrame frame={x.frame} radius={24} />
      </View>
    </Pressable>
  );
}

function Ring({ percent }: { percent: number }) {
  const { c } = useTheme();
  const r = 26;
  const len = 2 * Math.PI * r;
  return (
    <View style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={60} height={60} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={30} cy={30} r={r} stroke={c.input} strokeWidth={6} fill="none" />
        <Circle cx={30} cy={30} r={r} stroke={c.primary} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={`${(len * percent) / 100} ${len}`} />
      </Svg>
      <Text variant="body" weight={700} style={{ fontSize: 14 }}>
        {percent}%
      </Text>
    </View>
  );
}

/** Seeker — People (SeekPeople / SeekPeopleComplete): top profiles in your field, Max, how to join the top, everyone. */
export default function People() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useSeeker();
  const comp = completeness(profile);
  const [sphere, setSphere] = useState<'all' | TalentSphere>('all');
  const everyone = useMemo(
    () =>
      candidates
        .filter((x) => sphere === 'all' || x.sphere === sphere)
        .slice()
        .sort((a, b) => tierRank(b.tier) - tierRank(a.tier)),
    [sphere],
  );
  const [count, setCount] = useState(10);
  const shown = everyone.slice(0, count);
  const rows = Array.from({ length: Math.ceil(shown.length / 2) }, (_, i) => shown.slice(i * 2, i * 2 + 2));
  const steps: [IconName, string, string][] = [
    ['play', 'Record a video presentation', '+20%'],
    ['camera', 'Add 3 more photos', '+10%'],
    ['globe', 'Add the languages you speak', '+10%'],
  ];
  const done = comp.percent >= 100;

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView
        onScroll={(e) => {
          const { layoutMeasurement: l, contentOffset: o, contentSize: s } = e.nativeEvent;
          if (l.height + o.y > s.height - 400 && count < everyone.length) setCount((n) => n + 10);
        }}
        scrollEventThrottle={64}
        contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + 16 }}>
        <PatternHeader style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 26 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Logo height={26} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {TOP.slice(0, 3).map((x, i) => (
                <Image key={x.id} source={x.photo} contentFit="cover" style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: c.primary, marginLeft: i ? -8 : 0 }} />
              ))}
              <Text variant="caption" weight={700} color="#FFFFFF" style={{ marginLeft: 8, fontSize: 12 }}>
                4 000+
              </Text>
            </View>
          </View>
          <Text variant="displayL" color="#FFFFFF" accessibilityRole="header" style={{ marginTop: 18, fontSize: 24, lineHeight: 30 }}>
            People on 919
          </Text>
          <Text variant="body" color="rgba(255,255,255,0.92)" style={{ marginTop: 6, fontSize: 14, lineHeight: 20 }}>
            See how the best profiles look and make yours stand out.
          </Text>
        </PatternHeader>

        <View style={{ width: '100%', maxWidth: 640, alignSelf: 'center' }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 22, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="title" style={{ fontSize: 18 }}>
              Top in Hospitality
            </Text>
            <View style={{ height: 24, paddingHorizontal: 9, borderRadius: 999, backgroundColor: c.primarySecondary, justifyContent: 'center' }}>
              <Text variant="caption" weight={700} color="link" style={{ fontSize: 11 }}>
                Your field
              </Text>
            </View>
          </View>
          <Text variant="bodyS" color="textBody" style={{ paddingHorizontal: 20, marginTop: 2, fontSize: 13 }}>
            The most complete profiles this week
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingLeft: 8, paddingRight: 20, paddingTop: 14, paddingBottom: 18 }}>
            {TOP.map((x, i) => (
              <TopCard key={x.id} c={x} rank={i + 1} />
            ))}
          </ScrollView>

          <View style={{ marginHorizontal: 16, borderRadius: 26, backgroundColor: '#121A26', paddingTop: 18, paddingBottom: 16, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }}>
              <View style={{ height: 26, paddingLeft: 5, paddingRight: 10, borderRadius: 999, backgroundColor: 'rgba(255,196,26,0.16)', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <TierBadge tier="max" size={18} />
                <Text variant="caption" weight={700} color="#FFC21A">
                  Max
                </Text>
              </View>
              <Pressable onPress={() => router.push('/profile/plans')} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 }}>
                <Text variant="bodyS" weight={700} color="#FFFFFF" style={{ fontSize: 13 }}>
                  Get Max
                </Text>
                <Icon name="chevron-right" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text variant="title" color="#FFFFFF" style={{ paddingHorizontal: 20, marginTop: 12, fontSize: 18 }}>
              Always first for employers
            </Text>
            <Text variant="bodyS" color="rgba(255,255,255,0.7)" style={{ paddingHorizontal: 20, marginTop: 6, fontSize: 13, lineHeight: 19 }}>
              Max profiles are pinned to the top of search and recommendations, with a frame of their choice.
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 16 }}>
              {MAX_STRIP.map((x) => (
                <Pressable key={x.id} onPress={() => open(x)} accessibilityRole="button" accessibilityLabel={`${x.name}, ${x.role}`} style={{ width: 76, alignItems: 'center', gap: 6 }}>
                  <View>
                    <FramedAvatar frame={x.frame} size={68} ring={3} gap={3} bg="#121A26">
                      <Image source={x.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} />
                    </FramedAvatar>
                    <TierBadge tier={x.tier} size={20} ring="#121A26" style={{ position: 'absolute', left: 0, top: 0 }} />
                  </View>
                  <Text variant="caption" weight={600} color="#FFFFFF" numberOfLines={1} style={{ fontSize: 12 }}>
                    {x.name}
                  </Text>
                  <Text variant="caption" weight={400} color="rgba(255,255,255,0.6)" numberOfLines={1} style={{ marginTop: -4, fontSize: 11 }}>
                    {x.role}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {done ? (
            <View style={{ margin: 16, marginBottom: 0, padding: 18, borderRadius: 24, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: c.successBack, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="title" color="successText" style={{ fontSize: 18 }}>
                  #7
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyL" weight={700}>
                  Your place in Hospitality
                </Text>
                <Text variant="bodyS" color="textBody" style={{ marginTop: 2, fontSize: 13, lineHeight: 18 }}>
                  ↑ 3 this week. Profile 100% complete — keep it fresh with new photos.
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ margin: 16, marginBottom: 0, padding: 18, borderRadius: 24, backgroundColor: c.surface, gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Ring percent={comp.percent} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyL" weight={700}>
                    {steps.length} steps to join the top
                  </Text>
                  <Text variant="bodyS" color="textBody" style={{ marginTop: 2, fontSize: 13, lineHeight: 19 }}>
                    Profiles at 100% get up to 4× more invites in Hospitality.
                  </Text>
                </View>
              </View>
              {steps.map(([icon, t, plus]) => (
                <Pressable
                  key={t}
                  onPress={() => router.push('/profile/general')}
                  accessibilityRole="link"
                  style={{ height: 48, borderRadius: 14, backgroundColor: c.input, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={icon} size={14} color="link" />
                  </View>
                  <Text variant="body" weight={600} style={{ flex: 1, fontSize: 14 }}>
                    {t}
                  </Text>
                  <Text variant="caption" weight={700} color="successText">
                    {plus}
                  </Text>
                </Pressable>
              ))}
              <Pressable onPress={() => router.push('/profile/general')} accessibilityRole="button" style={{ height: 52, borderRadius: 16, backgroundColor: c.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Text variant="bodyL" weight={700} color="ctaButtonText">
                  Complete my profile
                </Text>
                <Icon name="arrow-right" size={18} color="ctaButtonText" />
              </Pressable>
            </View>
          )}

          <Text variant="title" style={{ paddingHorizontal: 20, paddingTop: 26, fontSize: 18 }}>
            Everyone
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingVertical: 12 }}>
            <Chip label="All" selected={sphere === 'all'} onPress={() => (setSphere('all'), setCount(10))} />
            {talentSphereOrder.map((s) => (
              <Chip key={s} label={talentSphereLabels[s]} selected={sphere === s} onPress={() => (setSphere(s), setCount(10))} />
            ))}
          </ScrollView>
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {rows.map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
                {row.map((x) => (
                  <TalentCard key={x.id} t={{ ...x, sphere: x.sphere as never }} onPress={() => open(x)} />
                ))}
                {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
