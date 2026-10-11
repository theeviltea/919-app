import { Redirect, Tabs } from 'expo-router';

import { TabBar } from '@/components';
import { useSeeker } from '@/data/seeker';
import { useSession } from '@/data/session';
import { useTheme } from '@/theme';

/** Seeker app: Vacancies · Applications · Messages · Profile. */
export default function SeekerTabs() {
  const { c } = useTheme();
  const { user } = useSession();
  const { unreadTotal } = useSeeker();
  if (!user) return <Redirect href="/guest" />;
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.back }, animation: 'fade' }}
      tabBar={(props) => (
        <TabBar
          {...props}
          aliases={{ search: 'index' }}
          meta={{
            index: { label: 'Vacancies', icon: 'star' },
            applications: { label: 'Applications', icon: 'briefcase' },
            messages: { label: 'Messages', icon: 'message', badge: unreadTotal },
            profile: { label: 'Profile', icon: 'user' },
          }}
        />
      )}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="applications" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="profile" />
      {/* Search belongs to Vacancies: no tab of its own, the tab bar keeps Vacancies active. */}
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}
