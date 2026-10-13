import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, Icon, Pressable, SegmentedTabs, TAB_BAR_SPACE, Text } from '@/components';
import { hireStats, savedLabels, useEmployer, type HireStatus, type MyVacancy } from '@/data/employer';
import { findCandidate, talentSphereLabels, talentSphereOrder, type Candidate, type TalentSphere } from '@/data/talentPool';
import { PageTitle, Pill, useSoon } from '@/features/hire/ui';
import { useTheme } from '@/theme';

type Tab = 'mine' | 'saved';
type Filter = 'all' | HireStatus;
type SavedFilter = 'all' | TalentSphere;

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text variant="displayM" style={{ fontSize: 22, lineHeight: 26 }}>
        {n}
      </Text>
      <Text variant="caption" weight={400} color="textBody" style={{ marginTop: 4, fontSize: 12, lineHeight: 16 }}>
        {label}
      </Text>
    </View>
  );
}

function Faces({ faces }: { faces: MyVacancy['faces'] }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row' }}>
      {(faces ?? []).map((f, i) => (
        <Image
          key={i}
          source={f}
          contentFit="cover"
          contentPosition={{ top: '25%' }}
          style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: c.surface, marginLeft: i ? -10 : 0, backgroundColor: c.backDarker }}
        />
      ))}
    </View>
  );
}

/** Vacancy card in the hub (EmpHiring): status, days bar for active, moderation note, applicants, relaunch for archive. */
function VacancyCard({ v }: { v: MyVacancy }) {
  const { c } = useTheme();
  const soon = useSoon();
  const archived = v.status === 'archive';
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => soon('Vacancy page')} accessibilityRole="button" accessibilityLabel={v.title} style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={v.cover} contentFit="cover" style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: c.backDarker, opacity: archived ? 0.6 : 1 }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="bodyL" weight={600} numberOfLines={1} style={{ fontSize: 16, lineHeight: 21 }}>
              {v.title}
            </Text>
            <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 3, fontSize: 13 }}>
              {v.meta}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => soon('Vacancy actions')}
          accessibilityRole="button"
          accessibilityLabel="Vacancy actions"
          style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="more" size={20} color="textHeadline" />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {v.status === 'active' ? (
          <Pill label="Active" bg={c.successBack} fg={c.successText} h={26} />
        ) : v.status === 'review' ? (
          <Pill label="On review" icon="clock" bg={c.input} fg={c.textBody} h={26} />
        ) : (
          <Pill label="In archive" bg={c.input} fg={c.textBody} h={26} />
        )}
        {v.urgentLeft ? <Pill label={v.urgentLeft} icon="fire" bg={c.urgent} fg={c.onUrgent} h={26} /> : null}
        <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ flex: 1, fontSize: 13 }}>
          {v.note}
        </Text>
      </View>

      {v.status === 'active' && v.daysLeft != null ? (
        <View style={{ flexDirection: 'row', gap: 3 }} accessibilityLabel={`${v.daysLeft} of 7 days left`}>
          {Array.from({ length: 7 }, (_, i) => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 999, backgroundColor: i < v.daysLeft! ? c.primary : c.backDarker }} />
          ))}
        </View>
      ) : null}

      {v.status === 'review' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12, borderTopWidth: 1, borderColor: c.divider }}>
          <Icon name="clock" size={18} color="textBody" />
          <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>
            Moderation usually takes up to 2 hours. Applicants will appear here after publication.
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={() => soon('Applicants')}
          accessibilityRole="button"
          accessibilityLabel={`${v.applicants} applicants${v.fresh ? `, ${v.fresh} new` : ''}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12, borderTopWidth: 1, borderColor: c.divider }}>
          <Faces faces={v.faces} />
          <Text variant="body" weight={600} style={{ flex: 1, fontSize: 14 }}>
            {v.applicants} applicants
          </Text>
          {v.fresh ? <Pill label={`${v.fresh} new`} bg={c.primary} fg={c.ctaButtonText} h={24} /> : null}
          <Icon name="chevron-right" size={18} color="textLightSecondary" />
        </Pressable>
      )}

      {archived ? (
        <Pressable
          onPress={() => soon('Relaunch')}
          accessibilityRole="button"
          style={{ height: 44, borderRadius: 14, backgroundColor: c.primarySecondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name="flash" size={18} color="link" />
          <Text variant="body" weight={700} color="link" style={{ fontSize: 15 }}>
            Relaunch for 7 days
          </Text>
        </Pressable>
      ) : null}
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
      style={{ flex: 1, backgroundColor: c.surface, borderRadius: 20, overflow: 'hidden' }}>
      <View style={{ height: 150, backgroundColor: ph }}>
        <Image source={t.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} transition={150} />
        {t.premium ? (
          <View
            style={{
              position: 'absolute',
              left: 8,
              top: 8,
              height: 24,
              paddingHorizontal: 8,
              borderRadius: 999,
              backgroundColor: c.labelOrangeBack,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}>
            <Icon name="star" size={12} color="labelOrangeText" />
            <Text variant="caption" weight={700} color="labelOrangeText" style={{ fontSize: 11 }}>
              Premium
            </Text>
          </View>
        ) : null}
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
    </Pressable>
  );
}

/** Employer — Vacancies hub (EmpHiring / EmpHiringSaved). */
export default function HireVacancies() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const soon = useSoon();
  const [tab, setTab] = useState<Tab>('mine');
  const [filter, setFilter] = useState<Filter>('all');
  const [savedFilter, setSavedFilter] = useState<SavedFilter>('all');
  const { vacancies: myVacancies } = useEmployer();
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
      <PageTitle title="Vacancies" action={{ icon: 'search', label: 'Search vacancies', onPress: () => soon('Vacancy search') }} />
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
            <Stat n={hireStats.fresh} label={'New\napplicants'} />
            <View style={{ width: 1, backgroundColor: c.divider }} />
            <Stat n={hireStats.hired} label={'Hired this\nmonth'} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            <Chip label={`All ${myVacancies.length}`} selected={filter === 'all'} onPress={() => setFilter('all')} />
            <Chip label={`Active ${count('active')}`} selected={filter === 'active'} onPress={() => setFilter('active')} />
            <Chip label={`On review ${count('review')}`} selected={filter === 'review'} onPress={() => setFilter('review')} />
            <Chip label={`Archive ${count('archive')}`} selected={filter === 'archive'} onPress={() => setFilter('archive')} />
          </ScrollView>
          {list.map((v) => (
            <VacancyCard key={v.id} v={v} />
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
    </ScrollView>
  );
}
