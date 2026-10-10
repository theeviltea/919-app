import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Logo, PatternHeader, Pressable, Text } from '@/components';
import { GuestBrowse, type GuestTab } from '@/features/vacancies/GuestBrowse';
import { useTheme } from '@/theme';

function SignInButton() {
  const { c } = useTheme();
  return (
    <Pressable onPress={() => router.push('/auth/sign-in')} accessibilityRole="button" style={{ height: 40, paddingHorizontal: 16, borderRadius: 14, backgroundColor: c.surface, justifyContent: 'center' }}>
      <Text variant="body" weight={700} style={{ fontSize: 14 }}>
        Sign in
      </Text>
    </Pressable>
  );
}

function SearchTrigger({ tab, height = 48, grow }: { tab: GuestTab; height?: number; grow?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/guest/search', params: { tab } })}
      accessibilityRole="search"
      accessibilityLabel="Search"
      style={{ flex: grow ? 1 : undefined, height, borderRadius: height > 44 ? 16 : 14, backgroundColor: c.surface, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon name="search" size={20} color="textBody" />
      <Text variant="body" color="textLightSecondary">
        {tab === 'vacancies' ? 'Role, venue or area' : 'Name, role or skill'}
      </Text>
    </Pressable>
  );
}

/** Guest zone — public vacancies and closed talent list. Sign in only in the header and on key actions. */
export default function GuestHome() {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const params = useLocalSearchParams<{ tab?: GuestTab }>();
  const [tab, setTab] = useState<GuestTab>(params.tab === 'talent' ? 'talent' : 'vacancies');
  const y = useState(() => new Animated.Value(0))[0];
  const [compact, setCompact] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y } } }], {
          useNativeDriver: false,
          listener: (e: { nativeEvent: { contentOffset: { y: number } } }) => setCompact(e.nativeEvent.contentOffset.y > 170),
        })}
        contentContainerStyle={{ width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <PatternHeader style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 18, marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Logo height={24} />
            <SignInButton />
          </View>
          <Text variant="displayXl" color="#FFFFFF" accessibilityRole="header" style={{ fontSize: 27, lineHeight: 31 }}>
            {'Find work.\nFind people.'}
          </Text>
          <SearchTrigger tab={tab} />
        </PatternHeader>
        <GuestBrowse tab={tab} onTab={setTab} />
      </Animated.ScrollView>

      {compact ? (
        <PatternHeader radius={24} style={{ position: 'absolute', left: 0, right: 0, top: 0, paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
            <SearchTrigger tab={tab} height={44} grow />
            <SignInButton />
          </View>
        </PatternHeader>
      ) : null}
    </View>
  );
}
