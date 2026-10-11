import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, Icon, Pressable, SegmentedTabs, StatusChip, TAB_BAR_SPACE, Text } from '@/components';
import { findVacancy } from '@/data/mock';
import { useSeeker, type Thread } from '@/data/seeker';
import { lastLine, ThreadAvatar } from '@/features/chat/ThreadAvatar';
import { useTheme } from '@/theme';

type Tab = 'active' | 'archive';

function ThreadRow({ t, last }: { t: Thread; last: boolean }) {
  const { c } = useTheme();
  const v = t.vacancyId ? findVacancy(t.vacancyId) : undefined;
  const line = lastLine(t);
  const unread = t.unread > 0;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: t.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${t.company.name}, ${t.person.name}${unread ? `, ${t.unread} unread` : ''}`}
      style={{ flexDirection: 'row', gap: 14, paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderColor: c.divider }}>
      <ThreadAvatar t={t} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="body" weight={700} numberOfLines={1} style={{ flex: 1 }}>
            {v ? v.title : t.company.name}
          </Text>
          <Text variant="caption" weight={400} color={unread ? 'link' : 'textLightSecondary'}>
            {t.time}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ flexShrink: 1 }}>
            {v ? `${t.company.name} · ` : ''}
            {t.person.name}, {t.person.role}
          </Text>
          {t.company.verified ? <Icon name="verified" size={14} color="primary" /> : null}
        </View>
        {t.state === 'request' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <StatusChip kind="new" label="Contact request" icon={null} />
            <View style={{ flex: 1 }} />
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary }} />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <Text variant="bodyS" weight={unread ? 700 : 400} color={unread ? 'textHeadline' : 'textBody'} numberOfLines={1} style={{ flex: 1 }}>
              {line.mine ? 'You: ' : ''}
              {line.text}
            </Text>
            {unread ? (
              <View style={{ minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="caption" weight={700} color="ctaButtonText">
                  {t.unread}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </Pressable>
  );
}

/** Messages — chats with employers. Active (incl. contact requests) and Archive. */
export default function Messages() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { threads } = useSeeker();
  const [tab, setTab] = useState<Tab>('active');
  const active = threads.filter((t) => !t.archived && t.state !== 'declined');
  const archive = threads.filter((t) => t.archived && t.state !== 'declined');
  const list = tab === 'active' ? active : archive;
  const requests = list.filter((t) => t.state === 'request');
  const rest = list.filter((t) => t.state !== 'request');

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, gap: 14, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <Text variant="displayL" accessibilityRole="header" style={{ fontSize: 24, lineHeight: 30 }}>
          Messages
        </Text>
        <SegmentedTabs<Tab>
          items={[
            { key: 'active', label: 'Active', count: active.length },
            { key: 'archive', label: 'Archive', count: archive.length },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        {list.length === 0 ? (
          tab === 'active' ? (
            <EmptyState icon="message" title="No messages yet" text="When an employer accepts your application or wants to contact you, the chat appears here." action={{ label: 'Browse vacancies', icon: 'search', onPress: () => router.navigate('/seeker') }} />
          ) : (
            <EmptyState icon="clock" title="Archive is empty" text="Chats for closed vacancies and withdrawn applications move here." passive />
          )
        ) : null}
        {requests.length ? (
          <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 16 }}>
            {requests.map((t, i) => (
              <ThreadRow key={t.id} t={t} last={i === requests.length - 1} />
            ))}
          </View>
        ) : null}
        {rest.length ? (
          <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 16 }}>
            {rest.map((t, i) => (
              <ThreadRow key={t.id} t={t} last={i === rest.length - 1} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
