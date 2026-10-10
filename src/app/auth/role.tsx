import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Logo, PatternHeader, Pressable, Text, type IconName } from '@/components';
import { useSession } from '@/data/session';
import { useFinishAuth } from '@/features/auth/useFinishAuth';
import { useTheme } from '@/theme';

function RoleCard({ icon, title, points, onPress }: { icon: IconName; title: string; points: string[]; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 12, boxShadow: '0 2px 8px rgba(14,26,43,0.08)' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={24} color="primary" />
        </View>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrow-right" size={20} color="primary" />
        </View>
      </View>
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
    </Pressable>
  );
}

/** Role choice after sign-up. Skipped when the guest action already defined the role. */
export default function Role() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone?: string; email?: string; social?: string }>();
  const { pendingRole } = useSession();
  const finish = useFinishAuth();

  useEffect(() => {
    if (pendingRole === 'seeker') router.replace({ pathname: '/auth/about', params });
  }, [pendingRole]); // eslint-disable-line react-hooks/exhaustive-deps

  // Employer onboarding (company, representative) lands in the employer stage; for now sign in as employer.
  const employer = () => finish({ role: 'employer', phone: params.phone, email: params.email });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.back }} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <PatternHeader style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 96, gap: 16 }}>
        <Logo height={26} />
        <Text variant="displayXl" color="#FFFFFF" accessibilityRole="header" style={{ fontSize: 27, lineHeight: 31 }}>
          {'Find work.\nFind people.'}
        </Text>
        <Text variant="body" color="rgba(255,255,255,0.88)" style={{ fontSize: 15 }}>
          Hospitality, events, F&B and modeling jobs. Who are you here as?
        </Text>
      </PatternHeader>
      <View style={{ marginTop: -72, paddingHorizontal: 20, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <RoleCard icon="briefcase" title="I'm looking for work" points={['Build your profile and CV', 'Apply to shifts in one tap', 'Get hired in hours, not weeks']} onPress={() => router.push({ pathname: '/auth/about', params })} />
        <RoleCard icon="building" title="I'm hiring" points={['Register your company', 'Post vacancies and castings', 'Find the best candidates']} onPress={employer} />
      </View>
    </ScrollView>
  );
}
