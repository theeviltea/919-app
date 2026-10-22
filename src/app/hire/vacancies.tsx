import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, Icon, MaxFrame, PhotoTierBadge, Pressable, SegmentedTabs, TAB_BAR_SPACE, Text } from '@/components';
import { hireStats, savedLabels, useEmployer, type HireStatus } from '@/data/employer';
import { findCandidate, talentSphereLabels, talentSphereOrder, type Candidate, type TalentSphere } from '@/data/talentPool';
import { PageTitle } from '@/features/hire/ui';
import { useVacancyActions } from '@/features/hire/VacancyActions';
import { VacancyCard } from '@/features/hire/VacancyHubCard';
import { useTheme } from '@/theme';

type Tab = 'mine' | 'saved';
type Filter = 'all' | HireStatus;
type SavedFilter = 'all' | TalentSphere;

function Stat({ n, label, accent }: { n: number; label: string; accent?: boolean }) {
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text variant="displayM" color={accent && n ? 'link' : undefined} style={{ fontSize: 22, lineHeight: 26 }}>
        {n}
      </Text>
      <Text variant="caption" weight={400} color="textBody" style={{ marginTop: 4, fontSize: 12, lineHeight: 16 }}>
        {label}
      </Text>
    </View>
  );
}

function SavedCard({ t }: { t: Candidate }) {
  const { c } = useTheme();
  const ph = [c.avatar1, c.avatar2, c.avatar3, c.avatar4, c.avatar5][t.placeholder - 1];
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/talent/[id]', params: { id: t.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${t.name}, ${t.role}, ${t.city}`}
      style={{ flex: 1, backgroundColor: c.surface, borderRadius: 20, overflow: 'hidden', zIndex: 0 }}>
      <View style={{ height: 150, backgroundColor: ph }}>
        <Image source={t.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} transition={150} />
        <PhotoTierBadge tier={t.tier} />
        <View style={{ position: 'absolute', right: 8, top: 8, width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bookmark-filled" size={18} color="primary" />
        </View>
      </View>
      <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 }}>
        <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 14 }}>
          {t.name}
        </Text>
        <Text variant="caption" weight={400} color="textBody" numberOfLines={1} style={{ marginTop: 2 }}>
          {t.role} · {t.city}
        </Text>
        <Text variant="caption" weight={400} color="textLightSecondary" style={{ marginTop: 8, fontSize: 11 }}>
          {savedLabels[t.id] ?? 'Saved today'}
        </Text>
      </View>
      <MaxFrame frame={t.frame} />
    </Pressable>
  );
}

/** Employer — Vacancies hub (EmpHiring / EmpHiringSaved). */
export default function HireVacancies() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('mine');
  const [filter, setFilter] = useState<Filter>('all');
  const [savedFilter, setSavedFilter] = useState<SavedFilter>('all');
  const { vacancies: myVacancies, freshTotal } = useEmployer();
  const actions = useVacancyActions();
  const count = (s: HireStatus) => myVacancies.filter((v) => v.status === s).length;
  const list = myVacancies.filter((v) => filter === 'all' || v.status === filter);
  const { savedIds } = useEmployer();
  const savedAll = savedIds.map(findCandidate).filter((x): x is Candidate => !!x);
  const saved = savedAll.filter((t) => savedFilter === 'all' || t.sphere === savedFilter);
  const savedCount = (f: SavedFilter) => savedAll.filter((t) => f === 'all' || t.sphere === f).length;
  const rows = Array.from({ length: Math.ceil(saved.length / 2) }, (_, i) => saved.slice(i * 2, i * 2 + 2));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.back }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 16, paddingBottom: TAB_BAR_SPACE + 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
      <PageTitle title="Vacancies" action={{ icon: 'search', label: 'Search vacancies', onPress: () => router.push('/hire/vacancy-search') }} />
      <SegmentedTabs<Tab>
        items={[
          { key: 'mine', label: 'My vacancies', count: myVacancies.length },
          { key: 'saved', label: 'Saved talent', count: savedAll.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'mine' ? (
        <>
          <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12 }}>
            <Stat n={count('active')} label={'Active\nvacancies'} />
            <View style={{ width: 1, backgroundColor: c.divider }} />
            <Stat n={freshTotal} label={'New\napplicants'} accent />
            <View style={{ width: 1, backgroundColor: c.divider }} />
            <Stat n={hireStats.hired} label={'Hired this\nmonth'} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            <Chip label={`All ${myVacancies.length}`} selected={filter === 'all'} onPress={() => setFilter('all')} />
            <Chip label={`Active ${count('active')}`} selected={filter === 'active'} onPress={() => setFilter('active')} />
            <Chip label={`On review ${count('review')}`} selected={filter === 'review'} onPress={() => setFilter('review')} />
            <Chip label={`Archive ${count('archive')}`} selected={filter === 'archive'} onPress={() => setFilter('archive')} />
          </ScrollView>
          {filter === 'archive' ? (
            <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, backgroundColor: c.primarySecondary }}>
              <Icon name="clock" size={18} color="link" />
              <Text variant="bodyS" color="link" style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>
                Vacancies stay live for 7 days, then move here automatically. Relaunch one to publish it again for 7 days — applicants and chats stay.
              </Text>
            </View>
          ) : null}
          {list.map((v) => (
            <VacancyCard key={v.id} v={v} onActions={(sh) => actions.open(v.id, sh)} />
          ))}
        </>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            {([['all', 'All'], ...talentSphereOrder.filter((k) => savedCount(k)).map((k) => [k, talentSphereLabels[k]])] as [SavedFilter, string][]).map(([k, l]) => (
              <Chip key={k} label={`${l} ${savedCount(k)}`} selected={savedFilter === k} onPress={() => setSavedFilter(k)} />
            ))}
          </ScrollView>
          {rows.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
              {r.map((t) => (
                <SavedCard key={t.id} t={t} />
              ))}
              {r.length === 1 ? <View style={{ flex: 1 }} /> : null}
            </View>
          ))}
        </>
      )}
      {actions.sheets}
    </ScrollView>
  );
}
