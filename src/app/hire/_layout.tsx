import { Redirect, router, Tabs } from 'expo-router';

import { TabBar } from '@/components';
import { hireStats, useEmployer } from '@/data/employer';
import { useSession } from '@/data/session';
import { useTheme } from '@/theme';

/** Employer app: Talent · Vacancies · (+ Post a vacancy) · Messages · Company. */
export default function EmployerTabs() {
  const { c } = useTheme();
  const { user } = useSession();
  const { unreadTotal } = useEmployer();
  if (!user) return <Redirect href="/guest" />;
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.back }, animation: 'fade' }}
      tabBar={(props) => (
        <TabBar
          {...props}
          center={{ after: 'vacancies', label: 'Post a new vacancy', icon: 'add', onPress: () => router.push('/post/category') }}
          meta={{
            index: { label: 'Talent', icon: 'users' },
            vacancies: { label: 'Vacancies', icon: 'briefcase', badge: hireStats.fresh },
            messages: { label: 'Messages', icon: 'message', badge: unreadTotal },
            company: { label: 'Company', icon: 'building' },
          }}
        />
      )}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="vacancies" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="company" />
    </Tabs>
  );
}
