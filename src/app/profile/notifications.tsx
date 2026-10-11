import { View } from 'react-native';

import { Row, Toggle } from '@/components';
import { useSeeker } from '@/data/seeker';
import { GroupLabel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

const GROUPS: { label?: string; items: { key: string; title: string; subtitle?: string; icon?: 'notification' }[] }[] = [
  { items: [{ key: 'push', title: 'Push notifications', subtitle: 'Allow 919 to send notifications to this phone', icon: 'notification' }] },
  {
    label: 'Vacancies',
    items: [
      { key: 'newVacancies', title: 'New vacancies for you', subtitle: 'Matching your occupations and city' },
      { key: 'urgentNearby', title: 'Urgent hiring', subtitle: 'Shifts that start today or tomorrow' },
      { key: 'savedClosing', title: 'Saved vacancies', subtitle: 'A day before a saved vacancy closes' },
    ],
  },
  {
    label: 'Applications',
    items: [
      { key: 'appStatus', title: 'Application status', subtitle: 'Accepted, declined or vacancy closed' },
      { key: 'invites', title: 'Invites and contact requests', subtitle: 'An employer wants to talk to you' },
    ],
  },
  {
    label: 'Messages',
    items: [
      { key: 'messages', title: 'New messages' },
      { key: 'preview', title: 'Show message preview', subtitle: 'Text of the message on the lock screen' },
    ],
  },
  {
    label: 'Email',
    items: [
      { key: 'digest', title: 'Weekly digest', subtitle: 'Profile views and vacancies you missed' },
      { key: 'news', title: 'Product news and offers' },
    ],
  },
];

/** Notification switches. Everything except push is grouped by what triggers it. */
export default function Notifications() {
  const { c } = useTheme();
  const { prefs, setPref } = useSeeker();
  return (
    <SubScreen title="Notifications">
      {GROUPS.map((g, gi) => (
        <View key={gi} style={{ gap: 12 }}>
          {g.label ? <GroupLabel>{g.label}</GroupLabel> : null}
          <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 4, opacity: gi && !prefs.push && g.label !== 'Email' ? 0.5 : 1 }}>
            {g.items.map((it, i) => (
              <Row
                key={it.key}
                icon={it.icon}
                title={it.title}
                subtitle={it.subtitle}
                last={i === g.items.length - 1}
                right={<Toggle value={!!prefs[it.key]} onValueChange={(v) => setPref(it.key, v)} accessibilityLabel={it.title} />}
              />
            ))}
          </View>
        </View>
      ))}
    </SubScreen>
  );
}
