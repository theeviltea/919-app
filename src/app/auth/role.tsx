import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Icon, Logo, PatternHeader, Pressable, Text, type IconName } from '@/components';
import { useSession, type Role as RoleT } from '@/data/session';
import { useTheme } from '@/theme';

function RoleCard({ icon, title, points, onPress }: { icon: IconName; title: string; points: string[]; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 14, boxShadow: '0 10px 30px rgba(14,26,43,0.08)' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={24} color="primary" />
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrow-right" size={20} color="primary" />
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <Text variant="displayM" style={{ fontSize: 18, lineHeight: 23 }}>
          {title}
        </Text>
        <View style={{ gap: 6 }}>
        {points.map((p) => (
          <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="check" size={16} color="primary" />
            <Text variant="body" color="textPrimary" style={{ fontSize: 14 }}>
              {p}
            </Text>
          </View>
        ))}
        </View>
      </View>
    </Pressable>
  );
}

/** Sign-up, step 0 — who are you here as. Comes before the phone so it's clear from the start that 919 has two sides. */
export default function Role() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { setPendingRole } = useSession();

  const pick = (role: RoleT) => {
    setPendingRole(role);
    router.push('/auth/register');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.back }} contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}>
      <PatternHeader style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 96, gap: 22 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <BackButton tone="onBlue" />
          <Logo height={26} />
        </View>
        <View style={{ gap: 10 }}>
          <Text variant="displayXl" color="#FFFFFF" accessibilityRole="header" style={{ fontSize: 27, lineHeight: 31 }}>
            {'Find work.\nFind people.'}
          </Text>
          <Text variant="body" color="rgba(255,255,255,0.88)" style={{ fontSize: 15 }}>
            Hospitality, events, F&B and modeling jobs. Who are you here as?
          </Text>
        </View>
      </PatternHeader>
      <View style={{ marginTop: -60, paddingHorizontal: 20, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <RoleCard icon="briefcase" title="I'm looking for work" points={['Build your profile and CV', 'Apply to shifts in one tap', 'Get hired in hours, not weeks']} onPress={() => pick('seeker')} />
        <RoleCard icon="building" title="I'm hiring" points={['Register your company', 'Post vacancies and castings', 'Find the best candidates']} onPress={() => pick('employer')} />
      </View>
      <View style={{ flex: 1, minHeight: 24 }} />
      <Pressable onPress={() => router.replace('/auth/sign-in')} accessibilityRole="link" style={{ alignSelf: 'center', paddingVertical: 8 }}>
        <Text variant="body" color="textBody" style={{ fontSize: 15 }}>
          Already have an account?{' '}
          <Text variant="body" weight={700} color="link" style={{ fontSize: 15 }}>
            Sign in
          </Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}
