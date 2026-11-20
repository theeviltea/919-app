import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Chip, Icon, Pressable, SegmentedTabs, TAB_BAR_SPACE, Text, TierBadge } from '@/components';
import { useEmployer } from '@/data/employer';
import { SOURCES, ago, matchOne, statsOf, viewersOf, viewsSeries, type Viewer } from '@/data/vacancyStats';
import { AnalyticsLocked, Bars, fmt, pct, useAnalyticsAccess } from '@/features/hire/analytics';
import { Pill } from '@/features/hire/ui';
import { useTheme } from '@/theme';

type Who = 'all' | 'not' | 'applied';

function Card({ title, right, children, gap = 12 }: { title: string; right?: string; children: React.ReactNode; gap?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 16, gap }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <Text variant="bodyL" weight={700} accessibilityRole="header" style={{ flex: 1, fontSize: 17 }}>
          {title}
        </Text>
        {right ? (
          <Text variant="caption" weight={400} color="textBody" style={{ fontSize: 12 }}>
            {right}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function ViewerRow({ x, vacancyTitle }: { x: Viewer; vacancyTitle?: string }) {
  const { c } = useTheme();
  const { vacancies } = useEmployer();
  const v = vacancies.find((y) => y.id === x.vacancyId);
  const m = v ? matchOne(x.c, v) : null;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/talent/[id]', params: { id: x.c.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${x.c.name}, viewed ${ago(x.minutesAgo)}, ${x.applied ? 'applied' : 'didn’t apply'}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.divider }}>
      <Image source={x.c.photo} contentFit="cover" contentPosition={{ top: '20%' }} style={{ width: 44, height: 44, borderRadius: 22 }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15, flexShrink: 1 }}>
            {x.c.name}
          </Text>
          <TierBadge tier={x.c.tier} size={16} />
        </View>
        <Text variant="caption" weight={400} color="textBody" numberOfLines={1} style={{ marginTop: 2, fontSize: 12 }}>
          {x.c.role.split(',')[0]} · {ago(x.minutesAgo)}
          {vacancyTitle ? ` · ${vacancyTitle}` : ''}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
          {x.applied ? <Pill label="Applied" icon="check" bg={c.successBack} fg="successText" /> : <Pill label="Didn’t apply" bg={c.input} fg="textBody" />}
          {m && m.score >= 70 ? <Pill label={`${m.score}% match`} bg={c.primarySecondary} fg="link" /> : null}
        </View>
      </View>
      <Icon name="chevron-right" size={18} color="textLightSecondary" />
    </Pressable>
  );
}

/** Employer — Analytics (EmpAnalytics / EmpAnalyticsLocked). Opened from the widget on Vacancies; lives in the Vacancies tab. */
export default function HireAnalytics() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const open = useAnalyticsAccess();
  const { v: initial } = useLocalSearchParams<{ v?: string }>();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.back }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: TAB_BAR_SPACE + 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <BackButton onPress={() => (router.canGoBack() ? router.back() : router.navigate('/hire/vacancies'))} />
        <Text variant="displayM" accessibilityRole="header" style={{ flex: 1, fontSize: 22, lineHeight: 28 }}>
          Analytics
        </Text>
      </View>
      {open ? <Dashboard initial={initial} /> : <AnalyticsLocked />}
    </ScrollView>
  );
}

function Dashboard({ initial }: { initial?: string }) {
  const { c } = useTheme();
  const e = useEmployer();
  const [days, setDays] = useState<'7' | '14'>('7');
  const [only, setOnly] = useState(initial ?? 'all');
  const [who, setWho] = useState<Who>('all');
  const d = Number(days);
  const applied = useMemo(() => Object.fromEntries(Object.entries(e.applicants).map(([k, xs]) => [k, xs.map((x) => x.candidateId)])), [e.applicants]);
  // Active vacancies, plus archived ones that still got views in the chosen period.
  const live = e.vacancies.filter((v) => v.status === 'active' || (v.status === 'archive' && viewsSeries(v, d).some((x) => x > 0)));
  const rows = live.map((v) => ({ v, s: statsOf(v, d, (e.applicants[v.id] ?? []).length || v.applicants || 0) }));
  const pick = only === 'all' ? rows : rows.filter((r) => r.v.id === only);
  const sum = (k: 'views' | 'viewers' | 'applications' | 'saves') => pick.reduce((a, r) => a + r.s[k], 0);
  const series = Array.from({ length: d }, (_, i) => pick.reduce((a, r) => a + viewsSeries(r.v, d)[i], 0));
  const prev = Math.round(sum('views') * 0.86);
  const viewers = viewersOf(e.vacancies, applied).filter((x) => (only === 'all' || x.vacancyId === only) && (who === 'all' || (who === 'applied' ? x.applied : !x.applied)));
  const title = (id: string) => e.vacancies.find((v) => v.id === id)?.title ?? '';
  const conv = sum('viewers') ? sum('applications') / sum('viewers') : 0;
  const kpis: [string, string, string][] = [
    ['Views', fmt(sum('views')), `+${Math.round((sum('views') / Math.max(1, prev) - 1) * 100)}% vs previous ${d} days`],
    ['Unique viewers', fmt(sum('viewers')), 'job seekers and guests'],
    ['Applications', fmt(sum('applications')), `${sum('saves')} saved a vacancy`],
    ['View → apply', pct(conv), 'of viewers applied'],
  ];
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        <Chip label="All vacancies" selected={only === 'all'} onPress={() => setOnly('all')} />
        {live.map((v) => (
          <Chip key={v.id} label={v.title} selected={only === v.id} onPress={() => setOnly(v.id)} />
        ))}
      </ScrollView>
      <SegmentedTabs<'7' | '14'>
        items={[
          { key: '7', label: '7 days' },
          { key: '14', label: '14 days' },
        ]}
        value={days}
        onChange={setDays}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {kpis.map(([k, n, s]) => (
          <View key={k} style={{ width: '48.6%', flexGrow: 1, backgroundColor: c.surface, borderRadius: 20, padding: 14 }}>
            <Text variant="caption" weight={600} color="textBody" style={{ fontSize: 12 }}>
              {k}
            </Text>
            <Text variant="displayM" style={{ marginTop: 4, fontSize: 22, lineHeight: 28 }}>
              {n}
            </Text>
            <Text variant="caption" weight={400} color="textBody" numberOfLines={2} style={{ marginTop: 2, fontSize: 11, lineHeight: 15 }}>
              {s}
            </Text>
          </View>
        ))}
      </View>
      <Card title="Views per day" right={`last ${d} days`}>
        <Bars values={series} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[`${d} days ago`, 'Today'].map((t) => (
            <Text key={t} variant="caption" weight={400} color="textLightSecondary" style={{ fontSize: 11 }}>
              {t}
            </Text>
          ))}
        </View>
      </Card>
      <Card title="Where views come from" right="share of views">
        {SOURCES.map(([k, v]) => (
          <View key={k} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="bodyS" weight={600} style={{ fontSize: 13 }}>
                {k}
              </Text>
              <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                {v}%
              </Text>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: c.backDarker, overflow: 'hidden' }}>
              <View style={{ width: `${v}%`, height: 6, borderRadius: 3, backgroundColor: c.primary }} />
            </View>
          </View>
        ))}
      </Card>
      <Card title="Who viewed" right={`${viewers.length} people`} gap={8}>
        <SegmentedTabs<Who>
          items={[
            { key: 'all', label: 'Everyone' },
            { key: 'not', label: 'Didn’t apply' },
            { key: 'applied', label: 'Applied' },
          ]}
          value={who}
          onChange={setWho}
        />
        <View>
          {viewers.slice(0, 8).map((x) => (
            <ViewerRow key={x.c.id + x.vacancyId} x={x} vacancyTitle={only === 'all' ? title(x.vacancyId) : undefined} />
          ))}
          {!viewers.length ? (
            <Text variant="bodyS" color="textBody" style={{ paddingVertical: 12, fontSize: 13 }}>
              Nobody here yet.
            </Text>
          ) : null}
        </View>
        <Text variant="caption" weight={400} color="textBody" style={{ fontSize: 12, lineHeight: 17 }}>
          Guests and hidden profiles count in views but aren’t listed. Didn’t apply? You can message them first from their profile.
        </Text>
      </Card>
      <Card title="By vacancy" gap={0}>
        {rows.map(({ v, s }) => (
          <Pressable
            key={v.id}
            onPress={() => router.push({ pathname: '/my-vacancy/[id]', params: { id: v.id } })}
            accessibilityRole="button"
            style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.divider, marginTop: 8 }}>
            <Text variant="body" weight={600} numberOfLines={1} style={{ fontSize: 15 }}>
              {v.title}
            </Text>
            <Text variant="caption" weight={400} color="textBody" style={{ marginTop: 4, fontSize: 12 }}>
              {fmt(s.views)} views · {s.applications} applied · {pct(s.conversion)}
            </Text>
          </Pressable>
        ))}
      </Card>
    </>
  );
}
