import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet, Button, EmptyState, Icon, Pressable, SegmentedTabs, TAB_BAR_SPACE, Text, useToast } from '@/components';
import { useEmployer, type EmpThread } from '@/data/employer';
import { SwipeRow, type SwipeAction } from '@/features/chat/SwipeRow';
import { PageTitle, Pill, Round, useSoon } from '@/features/hire/ui';
import { SheetHero } from '@/features/profile/ui';
import { useTheme } from '@/theme';

type Box = EmpThread['box'];

// Swipe action fills from the design (EmpMessagesSwipe), the same in light and dark — white labels sit on them.
const SWIPE_GRAY = '#5E6670';
const SWIPE_RED = '#E0123F';

function Row({ t, last }: { t: EmpThread; last: boolean }) {
  const { c } = useTheme();
  const unread = t.unread > 0;
  const ctx = [...(t.direct ? ['direct'] : []), ...(t.vacancies ?? [])];
  const shown = ctx.slice(0, 2);
  const more = ctx.length - shown.length;
  return (
    <View style={{ backgroundColor: c.surface, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderColor: c.divider }}>
        <View style={{ width: 56, height: 56, opacity: t.box === 'inactive' ? 0.5 : 1 }}>
          <Round source={t.photo} size={56} />
          {t.online ? <View style={{ position: 'absolute', right: 1, bottom: 1, width: 14, height: 14, borderRadius: 7, borderWidth: 2.5, borderColor: c.surface, backgroundColor: c.success }} /> : null}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text variant="bodyL" weight={700} numberOfLines={1} style={{ flexShrink: 1, fontSize: 16 }}>
                {t.name}
              </Text>
              <Icon name="verified" size={16} color="primary" />
            </View>
            <Text variant="caption" weight={400} color="textBody" style={{ fontSize: 12 }}>
              {t.time}
            </Text>
          </View>
          {t.subtitle ? (
            <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 2, fontSize: 13 }}>
              {t.subtitle}
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, overflow: 'hidden' }}>
              {shown.map((x) =>
                x === 'direct' ? <Pill key={x} label="Direct" icon="message" bg={c.primarySecondary} fg={c.link} /> : <Pill key={x} label={x} icon="briefcase" bg={c.input} fg={c.textPrimary} shrink />,
              )}
              {more > 0 ? <Pill label={`+${more}`} bg={c.input} fg={c.textBody} /> : null}
            </View>
          )}
          {t.reason ? (
            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              <Pill label={t.reason} icon={t.reason === 'Blocked' ? 'lock' : 'cancel'} bg={c.input} fg={c.textBody} h={24} />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {t.lastIcon ? <Icon name={t.lastIcon} size={16} color={unread ? 'primary' : 'textBody'} /> : null}
                <Text variant="body" weight={unread ? 600 : 400} color={unread ? 'primary' : 'textBody'} numberOfLines={1} style={{ flexShrink: 1, fontSize: 14 }}>
                  {t.mine ? 'You: ' : ''}
                  {t.last}
                </Text>
              </View>
              {unread ? (
                <View style={{ minWidth: 20, height: 20, paddingHorizontal: 6, borderRadius: 10, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="caption" weight={700} color="ctaButtonText" style={{ fontSize: 11 }}>
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

/** Employer — Messages (EmpMessages / Inactive / Archive) with swipe actions (EmpMessagesSwipe). */
export default function HireMessages() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const soon = useSoon();
  const { threads, moveThread, deleteThread } = useEmployer();
  const [tab, setTab] = useState<Box>('active');
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<EmpThread | null>(null);
  const of = (b: Box) => threads.filter((t) => t.box === b);
  const list = of(tab);

  const move = (t: EmpThread, box: Box) => {
    moveThread(t.id, box);
    toast({ text: box === 'archive' ? 'Chat moved to Archive' : 'Chat restored to Active', icon: box === 'archive' ? 'clock' : 'check', aboveTabBar: true });
  };
  const remove = (t: EmpThread) => {
    deleteThread(t.id);
    setConfirm(null);
    toast({ text: 'Chat deleted', icon: 'trash', aboveTabBar: true });
  };
  const actionsFor = (t: EmpThread): SwipeAction[] =>
    t.box === 'archive'
      ? [
          { key: 'restore', label: 'Restore', icon: 'arrow-left', color: c.primary, onPress: () => move(t, 'active') },
          { key: 'delete', label: 'Delete forever', icon: 'trash', color: SWIPE_RED, onPress: () => setConfirm(t) },
        ]
      : t.box === 'active'
        ? [
            { key: 'archive', label: 'Archive', icon: 'clock', color: SWIPE_GRAY, onPress: () => move(t, 'archive') },
            { key: 'delete', label: 'Delete', icon: 'trash', color: SWIPE_RED, onPress: () => setConfirm(t) },
          ]
        : [{ key: 'delete', label: 'Delete', icon: 'trash', color: SWIPE_RED, onPress: () => setConfirm(t) }];

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 16, gap: 14, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <PageTitle title="Messages" action={{ icon: 'search', label: 'Search chats', onPress: () => soon('Chat search') }} />
        <SegmentedTabs<Box>
          items={[
            { key: 'active', label: 'Active', count: of('active').length },
            { key: 'inactive', label: 'Inactive', count: of('inactive').length },
            { key: 'archive', label: 'Archive', count: of('archive').length },
          ]}
          value={tab}
          onChange={(k) => (setOpenId(null), setTab(k))}
        />
      </View>
      <ScrollView onScrollBeginDrag={() => setOpenId(null)} contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: TAB_BAR_SPACE + 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        {tab !== 'active' && list.length ? (
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
            <Icon name="alert-circle" size={16} color="textBody" />
            <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>
              {tab === 'archive' ? 'Archived chats stay here until the candidate writes again — then they return to Active.' : 'Declined and blocked candidates. These chats are read-only.'}
            </Text>
          </View>
        ) : null}
        {list.length ? (
          <View style={{ backgroundColor: c.surface, borderRadius: 24, overflow: 'hidden' }}>
            {list.map((t, i) => (
              <SwipeRow
                key={t.id}
                actions={actionsFor(t)}
                open={openId === t.id}
                onOpen={(o) => setOpenId(o ? t.id : null)}
                label={`${t.name}${t.unread ? `, ${t.unread} unread` : ''}`}
                onPress={() => (openId ? setOpenId(null) : soon('Chat with the candidate'))}>
                <Row t={t} last={i === list.length - 1} />
              </SwipeRow>
            ))}
          </View>
        ) : (
          <EmptyState icon={tab === 'archive' ? 'clock' : 'message'} title={tab === 'active' ? 'No messages yet' : tab === 'archive' ? 'Archive is empty' : 'Nothing here'} text="Chats with candidates appear here when they apply or when you write first." passive />
        )}
      </ScrollView>

      <BottomSheet visible={!!confirm} onClose={() => setConfirm(null)}>
        {confirm ? (
          <>
            <SheetHero
              icon="trash"
              tone="danger"
              title={confirm.box === 'archive' ? `Delete chat with ${confirm.name} forever?` : `Delete chat with ${confirm.name}?`}
              text={
                confirm.box === 'archive'
                  ? `All messages and files are removed for you. This can’t be undone. If ${confirm.name.split(' ')[0]} writes again, a new chat starts.`
                  : 'Messages and media will be deleted for you. To keep the history, archive the chat instead.'
              }
            />
            <View style={{ gap: 12, marginTop: 8 }}>
              <Button size="l" variant="destructive" label={confirm.box === 'archive' ? 'Delete forever' : 'Delete'} onPress={() => remove(confirm)} />
              {confirm.box !== 'inactive' ? (
                <Button
                  size="l"
                  variant="neutral"
                  label={confirm.box === 'archive' ? 'Restore to Active instead' : 'Archive instead'}
                  onPress={() => (move(confirm, confirm.box === 'archive' ? 'active' : 'archive'), setConfirm(null))}
                />
              ) : null}
              {confirm.box !== 'active' ? (
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
