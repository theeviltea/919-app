import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, END_THRESHOLD, EndReachedProvider, PatternHeader, SearchBar, useEndReachedHub } from '@/components';
import { useSession } from '@/data/session';
import { GuestBrowse, type GuestTab } from '@/features/vacancies/GuestBrowse';
import { useTheme } from '@/theme';

/** Search — guests get both tabs; a signed-in seeker gets vacancies with save buttons. Quick filters only. */
export default function GuestSearch() {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const params = useLocalSearchParams<{ tab?: GuestTab; q?: string }>();
  const [tab, setTab] = useState<GuestTab>(params.tab === 'talent' ? 'talent' : 'vacancies');
  const [q, setQ] = useState(params.q ?? '');
  const seeker = useSession().user?.role === 'seeker';
  const { hub, notify } = useEndReachedHub();

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
      <ScrollView
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={64}
        onScroll={(e) => {
          const { contentSize, contentOffset, layoutMeasurement } = e.nativeEvent;
          if (contentSize.height - contentOffset.y - layoutMeasurement.height < END_THRESHOLD) notify();
        }}
        contentContainerStyle={{ paddingTop: 14, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <EndReachedProvider value={hub}>
          <GuestBrowse seeker={seeker} tab={tab} onTab={setTab} query={q} onClearQuery={() => setQ('')} />
        </EndReachedProvider>
      </ScrollView>
    </View>
  );
}
