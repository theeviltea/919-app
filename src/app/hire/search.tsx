import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Button, Chip, END_THRESHOLD, Icon, LoadMoreFooter, PatternHeader, Pressable, SearchBar, SegmentedTabs, TAB_BAR_SPACE, Text, usePaged, useToast } from '@/components';
import { useEmployer } from '@/data/employer';
import {
  applyTalentFilters,
  candidates,
  countTalentFilters,
  emptyTalentFilters,
  matchesCandidate,
  talentChips,
  talentSphereLabels,
  talentSphereOrder,
  type Candidate,
  type TalentFilters,
  type TalentSphere,
} from '@/data/talentPool';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { TalentFiltersModal } from '@/features/hire/TalentFiltersModal';
import { openVideo } from '@/features/media/viewer';
import { useTheme } from '@/theme';

type Tab = 'profiles' | 'videos';
type Sort = 'Best match' | 'Newest' | 'Most viewed';

function parseFilters(raw?: string): TalentFilters {
  if (!raw) return emptyTalentFilters;
  try {
    return { ...emptyTalentFilters, ...(JSON.parse(raw) as Partial<TalentFilters>) };
  } catch {
    return emptyTalentFilters;
  }
}

export default function TalentSearchScreen() {
  const params = useLocalSearchParams<{ q?: string; f?: string; tab?: Tab }>();
  // A new ?q= / ?f= (e.g. filters applied on the Talent home) starts a fresh search.
  return <TalentSearch key={`${params.q ?? ''}|${params.f ?? ''}|${params.tab ?? ''}`} initialQ={params.q ?? ''} initialFilters={parseFilters(params.f)} initialTab={params.tab === 'videos' ? 'videos' : 'profiles'} />;
}

function SaveButton({ id, label }: { id: string; label: string }) {
  const { toggleSaved, savedIds } = useEmployer();
  const toast = useToast();
  const on = savedIds.includes(id);
  return (
    <Pressable
      onPress={() => {
        const now = toggleSaved(id);
        toast({ text: now ? 'Saved to Saved talent' : 'Removed from Saved talent', icon: now ? 'bookmark-filled' : 'bookmark', aboveTabBar: true });
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: on }}
      hitSlop={6}
      style={{ position: 'absolute', right: 8, top: 8, width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={on ? 'bookmark-filled' : 'bookmark'} size={18} color={on ? '#3589F2' : '#18191C'} />
    </Pressable>
  );
}

/** Profile tile in the results grid (TalentSearch): photo 150, Premium, save, video length. */
function ProfileCard({ t }: { t: Candidate }) {
  const { c } = useTheme();
  const ph = [c.avatar1, c.avatar2, c.avatar3, c.avatar4, c.avatar5][t.placeholder - 1];
  return (
    <Pressable onPress={() => router.push({ pathname: '/talent/[id]', params: { id: t.id } })} accessibilityRole="button" accessibilityLabel={`${t.name}, ${t.role}, ${t.city}`} style={{ flex: 1, backgroundColor: c.surface, borderRadius: 20, overflow: 'hidden' }}>
      <View style={{ height: 150, backgroundColor: ph }}>
        <Image source={t.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} transition={150} />
        {t.premium ? (
          <View style={{ position: 'absolute', left: 8, top: 8, height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: c.labelOrangeBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="star" size={12} color="labelOrangeText" />
            <Text variant="caption" weight={700} color="labelOrangeText" style={{ fontSize: 11 }}>
              Premium
            </Text>
          </View>
        ) : null}
        <SaveButton id={t.id} label={`Save ${t.name}`} />
        {t.video ? (
          <View style={{ position: 'absolute', left: 8, bottom: 8, height: 22, paddingHorizontal: 8, borderRadius: 999, backgroundColor: 'rgba(14,26,43,0.6)', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="play-filled" size={10} color="#FFFFFF" />
            <Text variant="caption" weight={600} color="#FFFFFF" style={{ fontSize: 11 }}>
              {t.video.duration}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text variant="body" weight={600} numberOfLines={1} style={{ fontSize: 14, flexShrink: 1 }}>
            {t.name}
          </Text>
          {t.verified ? <Icon name="verified" size={14} color="primary" /> : null}
        </View>
        <Text variant="caption" weight={400} color="textBody" numberOfLines={2} style={{ marginTop: 2, fontSize: 12 }}>
          {t.role} · {t.city}
        </Text>
      </View>
    </Pressable>
  );
}

/** Video tile in the results grid (TalentSearchVideos): 252 high, dark. */
function VideoCard({ t }: { t: Candidate }) {
  return (
    <Pressable
      onPress={() => openVideo({ poster: t.photo, duration: t.video!.duration, label: 'Video presentation', name: t.name, verified: t.verified, avatar: t.photo, subtitle: `${t.role} · ${t.city}` })}
      accessibilityRole="button"
      accessibilityLabel={`Video presentation, ${t.name}, ${t.video!.duration}`}
      style={{ flex: 1, height: 252, borderRadius: 20, overflow: 'hidden', backgroundColor: t.tint }}>
      <Image source={t.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} transition={150} />
      <View style={{ position: 'absolute', left: 10, top: 10, height: 22, paddingHorizontal: 8, borderRadius: 999, backgroundColor: 'rgba(14,26,43,0.6)', justifyContent: 'center' }}>
        <Text variant="caption" weight={600} color="#FFFFFF" style={{ fontSize: 11 }}>
          {t.video!.duration}
        </Text>
      </View>
      <SaveButton id={t.id} label={`Save video of ${t.name}`} />
      <View style={{ position: 'absolute', left: 0, right: 0, top: 92, alignItems: 'center' }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="play" size={20} color="#18191C" />
        </View>
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 11, paddingTop: 10, paddingBottom: 11, backgroundColor: 'rgba(14,26,43,0.72)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="view" size={13} color="rgba(255,255,255,0.85)" />
          <Text variant="caption" weight={400} color="rgba(255,255,255,0.85)" style={{ fontSize: 11 }}>
            {t.video!.views}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
          <Text variant="body" weight={700} color="#FFFFFF" numberOfLines={1} style={{ fontSize: 14, flexShrink: 1 }}>
            {t.name}
          </Text>
          {t.verified ? <Icon name="verified" size={14} color="#FFFFFF" /> : null}
        </View>
        <Text variant="caption" weight={400} color="rgba(255,255,255,0.85)" numberOfLines={1} style={{ marginTop: 1, fontSize: 11 }}>
          {t.role} · {t.city}
        </Text>
      </View>
    </Pressable>
  );
}

function EmptyBlock({ icon, title, text, children }: { icon: 'search' | 'video' | 'filter'; title: string; text: string; children?: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingTop: 28, paddingHorizontal: 20, gap: 10 }}>
      <View style={{ width: 96, height: 96, borderRadius: 30, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Icon name={icon} size={40} color="primary" />
      </View>
      <Text variant="title" align="center">
        {title}
      </Text>
      <Text variant="body" color="textBody" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
        {text}
      </Text>
      <View style={{ alignSelf: 'stretch', gap: 12, marginTop: 14 }}>{children}</View>
    </View>
  );
}

function LinkButton({ icon, label, onPress }: { icon: 'location' | 'users'; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 }}>
      <Icon name={icon} size={18} color="link" />
      <Text variant="body" weight={700} color="link" style={{ fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Employer talent search (TalentSearch / TalentSearchVideos / *Empty / TalentFilterResults / TalentFilterEmpty). */
function TalentSearch({ initialQ, initialFilters, initialTab }: { initialQ: string; initialFilters: TalentFilters; initialTab: Tab }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState(initialQ);
  const [filters, setFilters] = useState(initialFilters);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [sphere, setSphere] = useState<TalentSphere | 'all'>('all');
  const [sort, setSort] = useState<Sort>('Best match');
  const [sheet, setSheet] = useState<'filters' | 'sort' | null>(null);

  const nFilters = countTalentFilters(filters);
  const chips = talentChips(filters);
  const byQuery = useMemo(() => candidates.filter((x) => matchesCandidate(x, q)), [q]);
  const filtered = useMemo(() => applyTalentFilters(byQuery, filters), [byQuery, filters]);
  // Without filters the field chips narrow the list; with filters the chips show what's applied instead.
  const scoped = nFilters || sphere === 'all' ? filtered : filtered.filter((x) => x.sphere === sphere);
  const sorted = useMemo(() => {
    const xs = [...scoped];
    if (sort === 'Most viewed') xs.sort((a, b) => parseFloat(b.video?.views ?? '0') - parseFloat(a.video?.views ?? '0'));
    else if (sort === 'Newest') xs.reverse();
    else xs.sort((a, b) => Number(b.premium) - Number(a.premium));
    return xs;
  }, [scoped, sort]);
  const profiles = sorted;
  const videos = sorted.filter((x) => x.video);
  const list = tab === 'profiles' ? profiles : videos;
  const paged = usePaged(list.length, `${q}|${tab}|${sphere}|${sort}|${JSON.stringify(filters)}`);
  const rows = Array.from({ length: Math.ceil(Math.min(paged.count, list.length) / 2) }, (_, i) => list.slice(i * 2, i * 2 + 2));
  const where = filters.city ? ` in ${filters.city}` : '';
  const pool = tab === 'profiles' ? filtered : filtered.filter((x) => x.video);
  const sphereCount = (s: TalentSphere) => pool.filter((x) => x.sphere === s).length;
  const noun = tab === 'profiles' ? 'profile' : 'video';
  const plural = (n: number) => `${n} ${noun}${n === 1 ? '' : 's'}`;

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <PatternHeader radius={24} style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', width: '100%', maxWidth: 600, alignSelf: 'center' }}>
          <BackButton tone="onBlue" onPress={() => (router.canGoBack() ? router.back() : router.navigate('/hire'))} />
          <View style={{ flex: 1 }}>
            <SearchBar value={q} onChangeText={setQ} placeholder="Name, role or skill" onFilterPress={() => setSheet('filters')} filterCount={nFilters} autoFocus={!initialQ && !nFilters} />
          </View>
        </View>
      </PatternHeader>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={64}
        onScroll={(e) => {
          const { contentSize, contentOffset, layoutMeasurement } = e.nativeEvent;
          if (contentSize.height - contentOffset.y - layoutMeasurement.height < END_THRESHOLD) paged.loadMore();
        }}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: TAB_BAR_SPACE + 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <View style={{ paddingHorizontal: 16 }}>
          <SegmentedTabs<Tab>
            items={[
              { key: 'profiles', label: 'Profiles', count: profiles.length, icon: 'users' },
              { key: 'videos', label: 'Videos', count: videos.length, icon: 'video' },
            ]}
            value={tab}
            onChange={setTab}
          />
        </View>

        {nFilters ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            {chips.map((ch) => (
              <Pressable
                key={ch.key}
                onPress={() => setFilters(ch.remove(filters))}
                accessibilityRole="button"
                accessibilityLabel={`Remove filter ${ch.label}`}
                style={{ height: 36, paddingLeft: 14, paddingRight: 10, borderRadius: 999, backgroundColor: c.inverse, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="bodyS" weight={600} color="onInverse" style={{ fontSize: 13 }}>
                  {ch.label}
                </Text>
                <Icon name="cancel" size={14} color="onInverse" />
              </Pressable>
            ))}
          </ScrollView>
        ) : pool.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            <Chip label={`All ${pool.length}`} selected={sphere === 'all'} onPress={() => setSphere('all')} />
            {talentSphereOrder
              .filter((s) => sphereCount(s))
              .map((s) => (
                <Chip key={s} label={`${talentSphereLabels[s]} ${sphereCount(s)}`} selected={sphere === s} onPress={() => setSphere(s)} />
              ))}
          </ScrollView>
        ) : null}

        {list.length || nFilters ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
            <Text variant="bodyS" color="textPrimary" style={{ flex: 1, fontSize: 13 }}>
              {nFilters ? (
                <>
                  <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
                    {plural(list.length)}
                  </Text>
                  {` match ${nFilters} filter${nFilters > 1 ? 's' : ''}`}
                  {list.length ? (
                    <>
                      {' · '}
                      <Text variant="bodyS" weight={700} color="link" style={{ fontSize: 13 }} onPress={() => setFilters(emptyTalentFilters)} accessibilityRole="button">
                        Clear
                      </Text>
                    </>
                  ) : null}
                </>
              ) : (
                `${plural(list.length)}${where}`
              )}
            </Text>
            <Pressable onPress={() => setSheet('sort')} accessibilityRole="button" accessibilityLabel={`Sort: ${sort}`} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="sort" size={16} color="textHeadline" />
              <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
                {sort}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {list.length ? (
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {rows.map((r, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                {r.map((t) => (tab === 'profiles' ? <ProfileCard key={t.id} t={t} /> : <VideoCard key={t.id} t={t} />))}
                {r.length === 1 ? <View style={{ flex: 1 }} /> : null}
              </View>
            ))}
            <LoadMoreFooter loading={paged.loading} done={paged.done} total={list.length} noun={tab === 'profiles' ? 'profiles' : 'videos'} />
          </View>
        ) : nFilters ? (
          // TalentFilterEmpty
          <View style={{ marginHorizontal: 16, backgroundColor: c.surface, borderRadius: 24, paddingVertical: 28, paddingHorizontal: 24, alignItems: 'center', gap: 10 }}>
            <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
              <Icon name="filter" size={28} color="primary" />
            </View>
            <Text variant="bodyL" weight={700} align="center" style={{ fontSize: 18 }}>
              No one matches yet
            </Text>
            <Text variant="body" color="textBody" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
              Try removing a filter — age range and languages narrow the list the most.
            </Text>
            <Button variant="neutral" label="Edit filters" onPress={() => setSheet('filters')} style={{ marginTop: 8, alignSelf: 'center', paddingHorizontal: 18 }} />
          </View>
        ) : tab === 'videos' && profiles.length ? (
          // TalentSearchVideosEmpty
          <View style={{ paddingHorizontal: 16 }}>
            <EmptyBlock
              icon="video"
              title={q.trim() ? `No videos for\n“${q.trim()}”` : 'No videos yet'}
              text={`${profiles.length} profile${profiles.length === 1 ? '' : 's'}${where} match this search, but none of them has recorded a video presentation yet.`}>
              <LinkButton icon="users" label={`Show ${profiles.length} profile${profiles.length === 1 ? '' : 's'}`} onPress={() => setTab('profiles')} />
              <Button variant="secondary" size="l" icon="cancel" label="Clear search" onPress={() => setQ('')} />
            </EmptyBlock>
          </View>
        ) : (
          // TalentSearchEmpty
          <View style={{ paddingHorizontal: 16 }}>
            <EmptyBlock
              icon="search"
              title={`Nothing found for\n“${q.trim()}”`}
              text={`No profiles or videos${where} match this search. Check the spelling, use fewer words or widen the location.`}>
              {filters.city ? <LinkButton icon="location" label={`Search in all ${filters.country === 'United Arab Emirates' ? 'UAE' : (filters.country ?? 'countries')}`} onPress={() => setFilters({ ...filters, city: undefined })} /> : null}
              <Button variant="secondary" size="l" icon="cancel" label="Clear search" onPress={() => setQ('')} />
            </EmptyBlock>
          </View>
        )}
      </ScrollView>

      <TalentFiltersModal key={String(sheet === 'filters')} visible={sheet === 'filters'} value={filters} source={byQuery} onClose={() => setSheet(null)} onApply={(f) => (setFilters(f), setSheet(null))} />
      <SelectSheet visible={sheet === 'sort'} title="Sort by" options={['Best match', 'Newest', 'Most viewed']} value={sort} onClose={() => setSheet(null)} onSelect={(v) => (setSort(v as Sort), setSheet(null))} />
    </View>
  );
}
