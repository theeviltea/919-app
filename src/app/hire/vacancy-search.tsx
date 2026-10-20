import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, Icon, Pressable, TAB_BAR_SPACE, Text } from '@/components';
import { useEmployer, type HireStatus } from '@/data/employer';
import { Highlight, SearchField } from '@/features/hire/SearchField';
import { useVacancyActions } from '@/features/hire/VacancyActions';
import { VacancyCard } from '@/features/hire/VacancyHubCard';
import { useTheme } from '@/theme';

type Filter = 'all' | 'active' | 'review' | 'archive';
const inFilter = (s: HireStatus, f: Filter) => f === 'all' || (f === 'review' ? s === 'review' || s === 'changes' || s === 'rejected' : s === f);

/** Employer — search in My vacancies (EmpHiringSearch / EmpHiringSearchEmpty): title, role, city, description. Lives in the Vacancies tab. */
export default function VacancySearch() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { vacancies } = useEmployer();
  const actions = useVacancyActions();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const needle = q.trim().toLowerCase();
  const matched = vacancies.filter((v) => !needle || [v.title, v.meta, v.detail?.role, v.detail?.city, v.detail?.description].some((s) => s?.toLowerCase().includes(needle)));
  const list = matched.filter((v) => inFilter(v.status, filter));
  const count = (f: Filter) => matched.filter((v) => inFilter(v.status, f)).length;

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <SearchField value={q} onChange={setQ} placeholder="Title, role or city" onCancel={() => (router.canGoBack() ? router.back() : router.navigate('/hire/vacancies'))} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {(
            [
              ['all', 'All'],
              ['active', 'Active'],
              ['review', 'On review'],
              ['archive', 'Archive'],
            ] as [Filter, string][]
          ).map(([k, l]) => (
            <Chip key={k} label={`${l} ${count(k)}`} selected={filter === k} onPress={() => setFilter(k)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: 14, paddingHorizontal: 16, paddingBottom: TAB_BAR_SPACE + 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        {needle && list.length ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 }}>
            <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 13 }}>
              <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
                {list.length} vacanc{list.length === 1 ? 'y' : 'ies'}
              </Text>
              {` for “${q.trim()}”`}
            </Text>
            <Pressable onPress={() => setQ('')} accessibilityRole="button" hitSlop={8}>
              <Text variant="bodyS" weight={700} color="link" style={{ fontSize: 13 }}>
                Clear
              </Text>
            </Pressable>
          </View>
        ) : null}

        {list.map((v) => (
          <View key={v.id} style={{ gap: 6 }}>
            <VacancyCard v={v} onActions={(sh) => actions.open(v.id, sh)} />
            {needle && !v.title.toLowerCase().includes(needle) && v.detail?.description.toLowerCase().includes(needle) ? (
              <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 8 }}>
                <Icon name="file" size={14} color="textBody" />
                <Highlight text={snippet(v.detail.description, needle)} q={q} color="textBody" style={{ flex: 1, fontSize: 12 }} numberOfLines={2} />
              </View>
            ) : null}
          </View>
        ))}

        {list.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 56, paddingHorizontal: 24 }}>
            <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="search" size={36} color="primary" />
            </View>
            <Text variant="title" align="center" style={{ marginTop: 20 }}>
              Nothing found
            </Text>
            <Text variant="body" color="textBody" align="center" style={{ marginTop: 10, fontSize: 14, lineHeight: 21 }}>
              {needle ? `None of your vacancies match “${q.trim()}”${filter !== 'all' ? ' in this tab' : ''}. Try a role like “Hostess” or a city.` : 'No vacancies in this tab yet.'}
            </Text>
          </View>
        ) : null}
        {actions.sheets}
      </ScrollView>
    </View>
  );
}

/** "…Shifts are 8 hours, 5 days…" around the first hit. */
function snippet(text: string, needle: string) {
  const i = text.toLowerCase().indexOf(needle);
  const start = Math.max(0, i - 40);
  return `${start ? '…' : ''}${text.slice(start, i + needle.length + 60)}${i + needle.length + 60 < text.length ? '…' : ''}`;
}
