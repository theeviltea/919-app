import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, PatternHeader, SearchBar } from '@/components';
import { GuestBrowse, type GuestTab } from '@/features/vacancies/GuestBrowse';
import { useTheme } from '@/theme';

/** Guest search — works without sign-in on both tabs. Quick filters only. */
export default function GuestSearch() {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const params = useLocalSearchParams<{ tab?: GuestTab; q?: string }>();
  const [tab, setTab] = useState<GuestTab>(params.tab === 'talent' ? 'talent' : 'vacancies');
  const [q, setQ] = useState(params.q ?? '');

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <PatternHeader radius={24} style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', width: '100%', maxWidth: 600, alignSelf: 'center' }}>
          <BackButton tone="onBlue" />
          <View style={{ flex: 1 }}>
            <SearchBar value={q} onChangeText={setQ} placeholder={tab === 'vacancies' ? 'Role, venue or area' : 'Name, role or skill'} autoFocus />
          </View>
        </View>
      </PatternHeader>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: 14, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <GuestBrowse tab={tab} onTab={setTab} query={q} onClearQuery={() => setQ('')} />
      </ScrollView>
    </View>
  );
}
