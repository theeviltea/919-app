import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Button, END_THRESHOLD, Icon, LoadMoreFooter, PatternHeader, Pressable, SearchBar, TAB_BAR_SPACE, Text, useToast, usePaged } from '@/components';
import { contractTypes, spheres } from '@/data/dictionaries';
import { feedVacancies } from '@/data/mock';
import { countryShort } from '@/data/registration';
import { useSeeker, type RecentSearch } from '@/data/seeker';
import type { Vacancy } from '@/data/types';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { applyFilters, countFilters, emptyFilters, FiltersSheet, type VacancyFilters } from '@/features/vacancies/FiltersSheet';
import { SaveButton } from '@/features/vacancies/SaveButton';
import { VacancyListCard } from '@/features/vacancies/VacancyListCard';
import { SeekSearchSkeleton } from '@/features/skeletons/SeekSearchSkeleton';
import { useFirstLoad } from '@/features/skeletons/useFirstLoad';
import { useTheme } from '@/theme';

type Sort = 'Newest' | 'Highest pay';
const POPULAR = ['Hostess', 'Waiter', 'Bartender', 'Promo model', 'DJ', 'Event staff', 'Barista'];

const matches = (v: Vacancy, q: string) => {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const hay = `${v.title} ${v.company.name} ${v.details.role} ${v.city} ${spheres[v.sphere]}`.toLowerCase();
  // "Event staff" → every word must appear; "Waiter" also finds "Waitress".
  return s.split(/\s+/).every((w) => hay.includes(w.replace(/(ess|er|s)$/, '')));
};

/** "Dubai · Hourly, Daily · from AED 100" */
function describeFilters(f: VacancyFilters) {
  const parts: string[] = [];
  if (f.city || f.country) parts.push(f.city ?? countryShort[f.country!] ?? f.country!);
  if (f.urgent) parts.push('Urgent');
  if (f.spheres.length) parts.push(f.spheres.map((s) => spheres[s]).join(', '));
  if (f.contracts.length) parts.push(f.contracts.map((k) => contractTypes[k].label).join(', '));
  if (f.min && f.max) parts.push(`AED ${f.min}–${f.max}`);
  else if (f.min) parts.push(`from AED ${f.min}`);
  else if (f.max) parts.push(`up to AED ${f.max}`);
  return parts.join(' · ');
}

/** Active filters as removable chips (SeekSearchResults). */
function chipsOf(f: VacancyFilters): { key: string; label: string; remove: (f: VacancyFilters) => VacancyFilters }[] {
  const out: { key: string; label: string; remove: (f: VacancyFilters) => VacancyFilters }[] = [];
  if (f.city) out.push({ key: 'city', label: f.city, remove: (x) => ({ ...x, city: undefined }) });
  else if (f.country) out.push({ key: 'country', label: countryShort[f.country] ?? f.country, remove: (x) => ({ ...x, country: undefined, city: undefined }) });
  if (f.urgent) out.push({ key: 'urgent', label: 'Urgent', remove: (x) => ({ ...x, urgent: false }) });
  f.spheres.forEach((s) => out.push({ key: `s-${s}`, label: spheres[s], remove: (x) => ({ ...x, spheres: x.spheres.filter((y) => y !== s) }) }));
  f.contracts.forEach((k) => out.push({ key: `c-${k}`, label: contractTypes[k].label, remove: (x) => ({ ...x, contracts: x.contracts.filter((y) => y !== k) }) }));
  if (f.min || f.max)
    out.push({ key: 'pay', label: f.min && f.max ? `AED ${f.min}–${f.max}` : f.min ? `From AED ${f.min}` : `Up to AED ${f.max}`, remove: (x) => ({ ...x, min: undefined, max: undefined }) });
  return out;
}

function parseFilters(raw?: string): VacancyFilters {
  if (!raw) return emptyFilters;
  try {
    return { ...emptyFilters, ...(JSON.parse(raw) as Partial<VacancyFilters>) };
  } catch {
    return emptyFilters;
  }
}

export default function SeekerSearchScreen() {
  const params = useLocalSearchParams<{ q?: string; f?: string }>();
  // A new ?q= (e.g. from a notification) or ?f= (filters applied on the feed) starts a fresh search.
  return <SeekerSearch key={`${params.q ?? ''}|${params.f ?? ''}`} initialQ={params.q ?? ''} initialFilters={parseFilters(params.f)} />;
}

/** Vacancy search (SeekSearch / SeekSearchResults / SeekSearchEmpty): recent and popular, then results with filter chips. */
function SeekerSearch({ initialQ, initialFilters }: { initialQ: string; initialFilters: VacancyFilters }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { recent, addRecent, removeRecent, clearRecent } = useSeeker();
  const [q, setQ] = useState(initialQ);
  const [filters, setFilters] = useState<VacancyFilters>(initialFilters);
  const [sort, setSort] = useState<Sort>('Newest');
  const [sheet, setSheet] = useState<'filters' | 'sort' | null>(null);

  const nFilters = countFilters(filters);
  const active = !!q.trim() || nFilters > 0;
  const results = useMemo(() => {
    const list = applyFilters(feedVacancies, filters).filter((v) => matches(v, q));
    return sort === 'Highest pay' ? [...list].sort((a, b) => b.pay.amount - a.pay.amount) : [...list].sort((a, b) => Number(b.urgent) - Number(a.urgent));
  }, [filters, q, sort]);
  const paged = usePaged(results.length, `${q}|${sort}|${JSON.stringify(filters)}`);
  // Each new query / filter set loads like a request: skeleton first (SeekSearchResultsSkeleton).
  const loading = useFirstLoad('seeker-search-results', 700) && active;
  const chips = chipsOf(filters);
  const remember = () => (q.trim() || nFilters ? addRecent({ q: q.trim(), filters }) : undefined);
  const apply = (r: Pick<RecentSearch, 'q' | 'filters'>) => {
    setQ(r.q);
    setFilters(r.filters);
  };
  const popularCount = (label: string) => (label === 'Urgent' ? feedVacancies.filter((v) => v.urgent).length : feedVacancies.filter((v) => matches(v, label)).length);
  const similar = useMemo(() => {
    if (results.length) return [];
    const loose = applyFilters(feedVacancies, { ...emptyFilters, country: filters.country, city: filters.city }).filter((v) => q.trim().split(/\s+/).some((w) => w && matches(v, w)));
    return (loose.length ? loose : feedVacancies.filter((v) => v.urgent)).slice(0, 3);
  }, [results.length, filters.country, filters.city, q]);

  const card = (v: Vacancy) => (
    <VacancyListCard key={v.id} v={v} onPress={() => (remember(), router.push({ pathname: '/vacancy/[id]', params: { id: v.id } }))} right={<SaveButton vacancyId={v.id} />} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <PatternHeader radius={24} style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', width: '100%', maxWidth: 600, alignSelf: 'center' }}>
          <BackButton tone="onBlue" onPress={() => (router.canGoBack() ? router.back() : router.navigate('/seeker'))} />
          <View style={{ flex: 1 }}>
            <SearchBar value={q} onChangeText={setQ} placeholder="Role, venue or area" onSubmit={remember} onFilterPress={() => setSheet('filters')} filterCount={nFilters} autoFocus={!initialQ && !countFilters(initialFilters)} />
          </View>
        </View>
      </PatternHeader>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={64}
        onScroll={(e) => {
          const { contentSize, contentOffset, layoutMeasurement } = e.nativeEvent;
          if (active && contentSize.height - contentOffset.y - layoutMeasurement.height < END_THRESHOLD) paged.loadMore();
        }}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: TAB_BAR_SPACE + 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        {chips.length ? (
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
        ) : null}

        {!active ? (
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {recent.length ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 4 }}>
                  <Text variant="bodyL" weight={700} accessibilityRole="header">
                    Recent searches
                  </Text>
                  <Pressable onPress={clearRecent} accessibilityRole="button" hitSlop={8}>
                    <Text variant="body" weight={600} color="link" style={{ fontSize: 14 }}>
                      Clear
                    </Text>
                  </Pressable>
                </View>
                <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 16 }}>
                  {recent.map((r, i) => (
                    <Pressable
                      key={r.id}
                      onPress={() => apply(r)}
                      accessibilityRole="button"
                      style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: i < recent.length - 1 ? 1 : 0, borderColor: c.divider }}>
                      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="clock" size={20} color="textBody" />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text variant="body" weight={600} style={{ fontSize: 15 }} numberOfLines={1}>
                          {r.q || 'All vacancies'}
                        </Text>
                        {describeFilters(r.filters) ? (
                          <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ fontSize: 13 }}>
                            {describeFilters(r.filters)}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable onPress={() => removeRecent(r.id)} accessibilityRole="button" accessibilityLabel={`Remove ${r.q}`} hitSlop={8} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="cancel" size={18} color="textLightSecondary" />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
            <Text variant="bodyL" weight={700} accessibilityRole="header" style={{ paddingHorizontal: 4, marginTop: 8 }}>
              Popular right now
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Pressable
                onPress={() => setFilters({ ...emptyFilters, urgent: true })}
                accessibilityRole="button"
                style={{ height: 40, paddingHorizontal: 14, borderRadius: 999, backgroundColor: c.urgent, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="fire" size={16} color="onUrgent" />
                <Text variant="body" weight={600} color="onUrgent" style={{ fontSize: 14 }}>
                  Urgent{' '}
                  <Text variant="body" weight={600} color="onUrgent" style={{ fontSize: 14, opacity: 0.6 }}>
                    {popularCount('Urgent')}
                  </Text>
                </Text>
              </Pressable>
              {POPULAR.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => (setQ(p), addRecent({ q: p, filters: emptyFilters }))}
                  accessibilityRole="button"
                  style={{ height: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: c.stroke, backgroundColor: c.surface, justifyContent: 'center' }}>
                  <Text variant="body" weight={600} style={{ fontSize: 14 }}>
                    {p}{' '}
                    <Text variant="body" weight={600} color="textBody" style={{ fontSize: 14 }}>
                      {popularCount(p)}
                    </Text>
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : loading ? (
          <View style={{ paddingHorizontal: 16 }}>
            <SeekSearchSkeleton />
          </View>
        ) : results.length ? (
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="bodyS" color="textPrimary" style={{ fontSize: 13 }}>
                <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
                  {results.length} vacanc{results.length === 1 ? 'y' : 'ies'}
                </Text>
                {q.trim() ? ` for “${q.trim()}”` : nFilters ? ` match ${nFilters} filter${nFilters > 1 ? 's' : ''}` : ''}
                {nFilters ? (
                  <>
                    {' · '}
                    <Text variant="bodyS" weight={700} color="link" style={{ fontSize: 13 }} onPress={() => setFilters(emptyFilters)} accessibilityRole="button">
                      Clear
                    </Text>
                  </>
                ) : null}
              </Text>
              <Pressable onPress={() => setSheet('sort')} accessibilityRole="button" accessibilityLabel={`Sort: ${sort}`} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="sort" size={16} color="textHeadline" />
                <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
                  {sort}
                </Text>
              </Pressable>
            </View>
            {results.slice(0, paged.count).map(card)}
            <LoadMoreFooter loading={paged.loading} done={paged.done} total={results.length} noun="vacancies" />
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            <View style={{ alignItems: 'center', paddingTop: 24, paddingHorizontal: 12 }}>
              <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="search" size={36} color="textHeadline" />
              </View>
              <Text variant="title" align="center" style={{ marginTop: 18 }}>
                Nothing found
              </Text>
              <Text variant="body" color="textBody" align="center" style={{ marginTop: 8, fontSize: 14, lineHeight: 21 }}>
                No vacancies{q.trim() ? ` for “${q.trim()}”` : ''}
                {nFilters ? ' with these filters' : ''}. Try {nFilters ? 'fewer filters or ' : ''}a broader role.
              </Text>
            </View>
            {nFilters ? <Button size="l" label="Clear filters" onPress={() => setFilters(emptyFilters)} style={{ marginTop: 8 }} /> : null}
            <Button
              size="l"
              variant="secondary"
              icon="notification"
              label="Notify me about new ones"
              onPress={() => (addRecent({ q: q.trim(), filters }), toast({ text: 'We’ll let you know when one appears', icon: 'notification', aboveTabBar: true }))}
            />
            {similar.length ? (
              <>
                <Text variant="bodyL" weight={700} accessibilityRole="header" style={{ marginTop: 8, paddingHorizontal: 4 }}>
                  Similar right now
                </Text>
                {similar.map(card)}
              </>
            ) : null}
          </View>
        )}
      </ScrollView>

      <FiltersSheet key={String(sheet === 'filters')} visible={sheet === 'filters'} value={filters} source={feedVacancies.filter((v) => matches(v, q))} onClose={() => setSheet(null)} onApply={(f) => (setFilters(f), setSheet(null))} />
      <SelectSheet visible={sheet === 'sort'} title="Sort by" options={['Newest', 'Highest pay']} value={sort} onClose={() => setSheet(null)} onSelect={(v) => (setSort(v as Sort), setSheet(null))} />
    </View>
  );
}
