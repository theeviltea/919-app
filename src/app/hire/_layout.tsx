import { Redirect, Tabs } from 'expo-router';

import { TabBar } from '@/components';
import { useEmployer } from '@/data/employer';
import { useSession } from '@/data/session';
import { LicencePromptSheet } from '@/features/employer/LicencePrompt';
import { useStartVacancy } from '@/features/post/gate';
import { useTheme } from '@/theme';

/** Employer app: Talent · Vacancies · (+ Post a vacancy) · Messages · Company. */
export default function EmployerTabs() {
  const { c } = useTheme();
  const { user } = useSession();
  const { unreadTotal, freshTotal } = useEmployer();
  const startVacancy = useStartVacancy();
  if (!user) return <Redirect href="/guest" />;
  return (
    <>
    <Tabs
      backBehavior="history"
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.back }, animation: 'fade' }}
      tabBar={(props) => (
        <TabBar
          {...props}
          aliases={{ search: 'index', applicants: 'vacancies', 'vacancy-search': 'vacancies', 'chat-search': 'messages' }}
          center={{ after: 'vacancies', label: 'Post a new vacancy', icon: 'add', onPress: startVacancy }}
          meta={{
            index: { label: 'Talent', icon: 'users' },
            vacancies: { label: 'Vacancies', icon: 'briefcase', badge: freshTotal },
            messages: { label: 'Messages', icon: 'message', badge: unreadTotal },
            company: { label: 'Company', icon: 'building' },
          }}
        />
      )}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="vacancies" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="company" />
      {/* Search belongs to Talent: no tab of its own, the tab bar keeps Talent active. */}
      <Tabs.Screen name="search" options={{ href: null }} />
      {/* Applicants of one vacancy: belongs to Vacancies. */}
      <Tabs.Screen name="applicants" options={{ href: null }} />
      <Tabs.Screen name="vacancy-search" options={{ href: null }} />
      <Tabs.Screen name="chat-search" options={{ href: null }} />
    </Tabs>
    <LicencePromptSheet />
    </>
  );
}
