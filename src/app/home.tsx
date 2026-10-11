import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState } from '@/components';
import { useSession } from '@/data/session';
import { ThemeRow } from '@/features/profile/ThemeRow';
import { useTheme } from '@/theme';

/** Temporary landing after sign-in — replaced by the seeker / employer tab apps in the next stages. */
export default function Home() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useSession();
  return (
    <View style={{ flex: 1, backgroundColor: c.back, paddingTop: insets.top + 24, paddingHorizontal: 20, gap: 16 }}>
      <EmptyState
        icon={user?.role === 'employer' ? 'building' : 'briefcase'}
        title={`Signed in as ${user?.role === 'employer' ? 'employer' : 'job seeker'}${user?.firstName ? ` · ${user.firstName}` : ''}`}
        text="The main app for this role is the next stage of the build. Vacancies stay open: you can respond to them now."
        action={{ label: 'Browse vacancies', icon: 'search', onPress: () => router.push('/guest') }}
      />
      <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 4 }}>
        <ThemeRow />
      </View>
      <Button variant="neutral" label="Sign out" icon="logout" onPress={() => (signOut(), router.replace('/guest'))} />
      <Button variant="secondary" label="Component kit" onPress={() => router.push('/kit')} />
    </View>
  );
}
