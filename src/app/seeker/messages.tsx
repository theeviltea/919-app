import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet, Button, EmptyState, Icon, Pressable, SegmentedTabs, StatusChip, TAB_BAR_SPACE, Text, useToast } from '@/components';
import { findVacancy } from '@/data/mock';
import { useSeeker, type Thread } from '@/data/seeker';
import { SwipeRow, type SwipeAction } from '@/features/chat/SwipeRow';
import { lastLine, ThreadAvatar } from '@/features/chat/ThreadAvatar';
import { SheetHero } from '@/features/profile/ui';
import { SeekMessagesSkeleton } from '@/features/skeletons/SeekMessagesSkeleton';
import { useFirstLoad } from '@/features/skeletons/useFirstLoad';
import { useTheme } from '@/theme';

type Tab = 'active' | 'archive';

// Swipe action fills from the design (EmpMessagesSwipe), the same in light and dark — white labels sit on them.
const SWIPE_GRAY = '#5E6670';
const SWIPE_RED = '#E0123F';

function ThreadRow({ t, last }: { t: Thread; last: boolean }) {
  const { c } = useTheme();
  const v = t.vacancyId ? findVacancy(t.vacancyId) : undefined;
  const line = lastLine(t);
  const unread = t.unread > 0;
  return (
    <View style={{ backgroundColor: c.surface, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', gap: 14, paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderColor: c.divider }}>
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
      </View>
    </View>
  );
}

/** Messages — chats with employers. Active (incl. contact requests) and Archive. Swipe a chat left for Archive / Delete (EmpMessagesSwipe). */
export default function Messages() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { threads, archiveThread, deleteThread } = useSeeker();
  const [tab, setTab] = useState<Tab>('active');
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Thread | null>(null);
  const loading = useFirstLoad('seeker-messages');
  const active = threads.filter((t) => !t.archived && t.state !== 'declined');
  const archive = threads.filter((t) => t.archived && t.state !== 'declined');
  const list = tab === 'active' ? active : archive;
  const requests = list.filter((t) => t.state === 'request');
  const rest = list.filter((t) => t.state !== 'request');

  const nameOf = (t: Thread) => t.company.name;
  const doArchive = (t: Thread, on: boolean) => {
    archiveThread(t.id, on);
    toast({ text: on ? 'Chat moved to Archive' : 'Chat restored to Active', icon: on ? 'clock' : 'check', aboveTabBar: true });
  };
  const doDelete = (t: Thread) => {
    deleteThread(t.id);
    setConfirm(null);
    toast({ text: 'Chat deleted', icon: 'trash', aboveTabBar: true });
  };
  const actionsFor = (t: Thread): SwipeAction[] =>
    t.archived
      ? [
          { key: 'restore', label: 'Restore', icon: 'arrow-left', color: c.primary, onPress: () => doArchive(t, false) },
          { key: 'delete', label: 'Delete forever', icon: 'trash', color: SWIPE_RED, onPress: () => setConfirm(t) },
        ]
      : [
          { key: 'archive', label: 'Archive', icon: 'clock', color: SWIPE_GRAY, onPress: () => doArchive(t, true) },
          { key: 'delete', label: 'Delete', icon: 'trash', color: SWIPE_RED, onPress: () => setConfirm(t) },
        ];
  const group = (items: Thread[]) => (
    <View style={{ backgroundColor: c.surface, borderRadius: 24, overflow: 'hidden' }}>
      {items.map((t, i) => (
        <SwipeRow
          key={t.id}
          actions={actionsFor(t)}
          open={openId === t.id}
          onOpen={(o) => setOpenId(o ? t.id : null)}
          label={`${t.company.name}, ${t.person.name}${t.unread ? `, ${t.unread} unread` : ''}`}
          onPress={() => (openId ? setOpenId(null) : router.push({ pathname: '/chat/[id]', params: { id: t.id } }))}>
          <ThreadRow t={t} last={i === items.length - 1} />
        </SwipeRow>
      ))}
    </View>
  );

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
          onChange={(k) => (setOpenId(null), setTab(k))}
        />
      </View>
      <ScrollView
        onScrollBeginDrag={() => setOpenId(null)}
        contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        {loading ? <SeekMessagesSkeleton /> : null}
        {!loading && list.length === 0 ? (
          tab === 'active' ? (
            <EmptyState
              icon="message"
              title="No messages yet"
              text="When an employer accepts your application or wants to contact you, the chat appears here."
              action={{ label: 'Browse vacancies', icon: 'search', onPress: () => router.navigate('/seeker') }}
            />
          ) : (
            <EmptyState icon="clock" title="Archive is empty" text="Chats for closed vacancies and withdrawn applications move here." passive />
          )
        ) : null}
        {!loading && tab === 'archive' && list.length ? (
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
            <Icon name="alert-circle" size={16} color="textBody" />
            <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>
              Archived chats stay here until the employer writes again — then they return to Active.
            </Text>
          </View>
        ) : null}
        {!loading && requests.length ? group(requests) : null}
        {!loading && rest.length ? group(rest) : null}
      </ScrollView>

      <BottomSheet visible={!!confirm} onClose={() => setConfirm(null)}>
        {confirm ? (
          <>
            <SheetHero
              icon="trash"
              tone="danger"
              title={confirm.archived ? `Delete chat with ${nameOf(confirm)} forever?` : `Delete chat with ${nameOf(confirm)}?`}
              text={
                confirm.archived
                  ? `All messages and files are removed for you. This can’t be undone. If ${nameOf(confirm)} writes again, a new chat starts.`
                  : 'Messages and media will be deleted for you. To keep the history, archive the chat instead.'
              }
            />
            <View style={{ gap: 12, marginTop: 8 }}>
              <Button size="l" variant="destructive" label={confirm.archived ? 'Delete forever' : 'Delete'} onPress={() => doDelete(confirm)} />
              <Button size="l" variant="neutral" label={confirm.archived ? 'Restore to Active instead' : 'Archive instead'} onPress={() => (doArchive(confirm, !confirm.archived), setConfirm(null))} />
              {confirm.archived ? (
                <Pressable onPress={() => setConfirm(null)} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: 8 }}>
                  <Text variant="body" weight={700} color="textBody">
                    Cancel
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </>
        ) : null}
      </BottomSheet>
    </View>
  );
}
