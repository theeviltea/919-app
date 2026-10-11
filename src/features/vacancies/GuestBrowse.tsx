import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Chip, EmptyState, SegmentedTabs, Text } from '@/components';
import { spheres, talentSpheres, vacancySpheres } from '@/data/dictionaries';
import { feedVacancies as vacancies, talents } from '@/data/mock';
import type { Sphere, Talent } from '@/data/types';
import { GuestAuthSheet } from '@/features/talent/GuestAuth';
import { TalentCard } from '@/features/talent/TalentCard';

import { SaveButton } from './SaveButton';
import { VacancyListCard } from './VacancyListCard';

export type GuestTab = 'vacancies' | 'talent';

type Props = {
  tab: GuestTab;
  onTab: (t: GuestTab) => void;
  query?: string;
  onClearQuery?: () => void;
  /** Signed-in seeker: vacancies only, with save buttons. */ seeker?: boolean;
};

/** Tabs + quick filter chips + results. Shared by the guest home and guest search. No counts for guests. */
export function GuestBrowse({ tab: tabProp, onTab, query = '', onClearQuery, seeker }: Props) {
  const tab: GuestTab = seeker ? 'vacancies' : tabProp;
  const [filter, setFilter] = useState<'all' | 'urgent' | Sphere>('all');
  const [authFor, setAuthFor] = useState<Talent | null>(null);
  const q = query.trim().toLowerCase();

  const vList = useMemo(
    () => vacancies.filter((v) => (filter === 'all' || (filter === 'urgent' ? v.urgent : v.sphere === filter)) && (!q || `${v.title} ${v.company.name} ${v.details.role}`.toLowerCase().includes(q))),
    [filter, q],
  );
  const tList = useMemo(() => talents.filter((t) => (filter === 'all' || t.sphere === filter) && (!q || `${t.role} ${t.name}`.toLowerCase().includes(q))), [filter, q]);

  const chips: { key: 'all' | 'urgent' | Sphere; label: string }[] =
    tab === 'vacancies'
      ? [{ key: 'all', label: 'All' }, { key: 'urgent', label: 'Urgent' }, ...vacancySpheres.map((s) => ({ key: s, label: spheres[s] }))]
      : [{ key: 'all', label: 'All' }, ...talentSpheres];

  const empty = tab === 'vacancies' ? vList.length === 0 : tList.length === 0;

  return (
    <View style={{ gap: 14 }}>
      {seeker ? null : (
        <View style={{ paddingHorizontal: 20 }}>
          <SegmentedTabs<GuestTab>
            items={[
              { key: 'vacancies', label: 'Vacancies' },
              { key: 'talent', label: 'Talent' },
            ]}
            value={tab}
            onChange={(t) => {
              setFilter('all');
              onTab(t);
            }}
          />
        </View>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
        {chips.map((ch) =>
          ch.key === 'urgent' ? (
            <UrgentChip key="urgent" selected={filter === 'urgent'} onPress={() => setFilter(filter === 'urgent' ? 'all' : 'urgent')} />
          ) : (
            <Chip key={ch.key} label={ch.label} selected={filter === ch.key} onPress={() => setFilter(ch.key)} />
          ),
        )}
      </ScrollView>
      {q && !empty ? (
        <Text variant="bodyS" color="textBody" style={{ paddingHorizontal: 20 }}>
          Results for{' '}
          <Text variant="bodyS" weight={700}>
            “{query.trim()}”
          </Text>
        </Text>
      ) : null}
      <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {empty ? (
          <View style={{ backgroundColor: 'transparent' }}>
            <EmptyState
              icon="search"
              title={q ? `Nothing for “${query.trim()}” yet` : 'Nothing here yet'}
              text={
                seeker
                  ? 'Try a broader word like “Waiter” or another sphere. New vacancies appear every hour.'
                  : tab === 'vacancies'
                    ? 'Try a broader word like “Waiter” or switch to Talent. New vacancies appear every hour.'
                    : 'Try a broader word or another category.'
              }
              action={onClearQuery ? { label: 'Clear search', onPress: onClearQuery } : undefined}
            />
          </View>
        ) : tab === 'vacancies' ? (
          <View style={{ gap: 12 }}>
            {vList.map((v) => (
              <VacancyListCard
                key={v.id}
                v={v}
                right={seeker ? <SaveButton vacancyId={v.id} /> : undefined}
                onPress={() =>
                  router.push({
                    pathname: '/vacancy/[id]',
                    params: { id: v.id },
                  })
                }
              />
            ))}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {tList.map((t) => (
              <View key={t.id} style={{ width: '48.5%', flexGrow: 1, maxWidth: '50%' }}>
                <TalentCard t={t} onPress={() => setAuthFor(t)} />
              </View>
            ))}
          </View>
        )}
      </View>
      <GuestAuthSheet
        visible={!!authFor}
        onClose={() => setAuthFor(null)}
        role="employer"
        title="Sign in to see profiles"
        subtitle="Full profiles, photos and videos are available to employers on 919."
        context={
          authFor
            ? {
                title: authFor.name,
                subtitle: `${authFor.role} · ${authFor.city}`,
                image: authFor.photo,
                tone: 'round',
              }
            : undefined
        }
        returnTo="/guest?tab=talent"
      />
    </View>
  );
}

/** Urgent quick filter: always yellow with the fire icon (product rules §5). */
function UrgentChip({ selected, onPress }: { selected: boolean; onPress: () => void }) {
  return <Chip label="Urgent" icon="fire" urgent selected={selected} onPress={onPress} />;
}
