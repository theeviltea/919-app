import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Icon, IconButton, Pressable, Text, useToast, type IconName } from '@/components';
import { findVacancy } from '@/data/mock';
import { useSeeker, type Notif, type NotifKind } from '@/data/seeker';
import { useTheme, type Colors } from '@/theme';
import { SeekNotificationsSkeleton } from '@/features/skeletons/SeekNotificationsSkeleton';
import { useFirstLoad } from '@/features/skeletons/useFirstLoad';

type Filter = 'all' | 'applications' | 'requests' | 'vacancies';

/** Small status badge on a vacancy cover. */
const badges: Partial<Record<NotifKind, { icon: IconName; bg: keyof Colors }>> = {
  request: { icon: 'message', bg: 'primary' },
  accepted: { icon: 'check', bg: 'successStrong' },
  declined: { icon: 'cancel', bg: 'dangerText' },
  hireAsk: { icon: 'briefcase', bg: 'primary' },
};
/** Round icon tiles for notifications without a vacancy picture. */
const tiles: Partial<Record<NotifKind, { icon: IconName; bg: keyof Colors; fg: keyof Colors }>> = {
  vacancies: { icon: 'play', bg: 'categoryMusicBack', fg: 'categoryMusicText' },
  urgent: { icon: 'fire', bg: 'urgent', fg: 'onUrgent' },
  saved: { icon: 'clock', bg: 'input', fg: 'textBody' },
  views: { icon: 'view', bg: 'primarySecondary', fg: 'primary' },
  video: { icon: 'video', bg: 'infoBack', fg: 'infoText' },
};

function Avatar({ n }: { n: Notif }) {
  const { c } = useTheme();
  const v = n.vacancyId ? findVacancy(n.vacancyId) : undefined;
  const tile = tiles[n.kind];
  if (tile || !v) {
    const t = tile ?? { icon: 'notification' as IconName, bg: 'input' as keyof Colors, fg: 'textBody' as keyof Colors };
    return (
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c[t.bg], alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={t.icon} size={20} color={t.fg} />
      </View>
    );
  }
  const b = badges[n.kind];
  return (
    <View style={{ width: 44, height: 44 }}>
      <Image source={v.cover} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.backDarker }} />
      {b ? (
        <View style={{ position: 'absolute', right: -3, bottom: -3, width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: c.surface, backgroundColor: c[b.bg], alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={b.icon} size={10} color="#FFFFFF" />
        </View>
      ) : null}
    </View>
  );
}

function Action({ label, primary, onPress }: { label: string; primary?: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ height: 36, paddingHorizontal: 14, borderRadius: 12, backgroundColor: primary ? c.primary : c.input, justifyContent: 'center' }}>
      <Text variant="bodyS" weight={700} color={primary ? 'ctaButtonText' : 'textHeadline'} style={{ fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Notification center: new (unread) first, then Today and Earlier. Tapping an item marks it read and opens its target. */
export default function Notifications() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { notifs, readNotif, readAllNotifs, removeNotif, acceptRequest, declineRequest } = useSeeker();
  const [filter, setFilter] = useState<Filter>('all');
  const loading = useFirstLoad('seeker-notifications');

  const shown = notifs.filter((n) => filter === 'all' || n.group === filter);
  const groups: { title: string; items: Notif[]; markAll?: boolean }[] = [
    { title: `New · ${shown.filter((n) => n.unread).length}`, items: shown.filter((n) => n.unread), markAll: true },
    { title: 'Today', items: shown.filter((n) => !n.unread && n.day === 'today') },
    { title: 'Earlier', items: shown.filter((n) => !n.unread && n.day === 'earlier') },
  ].filter((g) => g.items.length);
  const count = (f: Filter) => notifs.filter((n) => n.group === f).length;

  const open = (n: Notif, to: Href) => {
    readNotif(n.id);
    router.push(to);
  };
  const target = (n: Notif): Href => {
    switch (n.kind) {
      case 'request':
      case 'accepted':
        return { pathname: '/chat/[id]', params: { id: n.threadId! } };
      case 'vacancies':
        return { pathname: '/seeker/search', params: { q: 'DJ' } };
      case 'declined':
        return { pathname: '/seeker/search', params: { q: 'Waitress' } };
      case 'hireAsk':
        return { pathname: '/seeker/applications', params: { ask: n.vacancyId! } };
      case 'viewed':
      case 'saved':
        return '/seeker/applications';
      case 'views':
        return '/seeker/profile';
      case 'video':
        return '/profile/general';
      default:
        return { pathname: '/vacancy/[id]', params: { id: n.vacancyId! } };
    }
  };
  const actions = (n: Notif) => {
    if (n.kind === 'request')
      return (
        <>
          <Action
            label="Decline"
            onPress={() => {
              declineRequest(n.threadId!);
              toast({ text: 'Request declined. The employer won’t be notified', kind: 'neutral', icon: 'cancel' });
            }}
          />
          <Action
            label="Accept"
            primary
            onPress={() => {
              acceptRequest(n.threadId!);
              removeNotif(n.id);
              router.push({ pathname: '/chat/[id]', params: { id: n.threadId! } });
            }}
          />
        </>
      );
    if (n.kind === 'accepted') return <Action label="Open chat" primary onPress={() => open(n, target(n))} />;
    if (n.kind === 'hireAsk') return <Action label="Answer" primary onPress={() => open(n, target(n))} />;
    if (n.kind === 'vacancies') return <Action label="Show vacancies" onPress={() => open(n, target(n))} />;
    if (n.kind === 'declined') return <Action label="See similar" onPress={() => open(n, target(n))} />;
    if (n.kind === 'urgent') return <Action label="View vacancy" onPress={() => open(n, target(n))} />;
    return null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: insets.bottom + 40, gap: 12, flexGrow: 1, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <BackButton />
          <Text variant="bodyL" weight={700} align="center" accessibilityRole="header" style={{ flex: 1, fontSize: 17 }}>
            Notifications
          </Text>
          <IconButton icon="settings" label="Notification settings" onPress={() => router.push('/profile/notifications')} />
        </View>

        {notifs.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginHorizontal: -16, marginTop: 4 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            {(
              [
                ['all', 'All'],
                ['applications', 'Applications'],
                ['requests', 'Requests'],
                ['vacancies', 'Vacancies'],
              ] as [Filter, string][]
            ).map(([k, label]) => {
              const on = filter === k;
              const n = k === 'all' ? 0 : count(k);
              return (
                <Pressable
                  key={k}
                  onPress={() => setFilter(k)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  style={{ height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: on ? 0 : 1, borderColor: c.stroke, backgroundColor: on ? c.inverse : c.surface, justifyContent: 'center' }}>
                  <Text variant="bodyS" weight={600} color={on ? 'onInverse' : 'textHeadline'} style={{ fontSize: 13 }}>
                    {label}
                    {n ? (
                      <Text variant="bodyS" weight={600} color={on ? 'onInverse' : 'textBody'} style={{ fontSize: 13 }}>
                        {' '}
                        {n}
                      </Text>
                    ) : null}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {loading ? <SeekNotificationsSkeleton /> : null}
        {!loading && groups.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 72, paddingHorizontal: 24 }}>
            <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="notification" size={36} color="primary" />
            </View>
            <Text variant="title" align="center" style={{ marginTop: 20 }}>
              {filter === 'all' ? 'No notifications yet' : 'Nothing here yet'}
            </Text>
            <Text variant="body" color="textBody" align="center" style={{ marginTop: 10, fontSize: 14, lineHeight: 21 }}>
              We’ll let you know when employers reply to your applications, write to you or new vacancies match your profile.
            </Text>
            <Pressable
              onPress={() => router.navigate('/seeker')}
              accessibilityRole="button"
              style={{ marginTop: 24, height: 48, paddingHorizontal: 20, borderRadius: 16, backgroundColor: c.primarySecondary, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="search" size={18} color="link" />
              <Text variant="body" weight={700} color="link" style={{ fontSize: 15 }}>
                Browse vacancies
              </Text>
            </Pressable>
          </View>
        ) : null}

        {(loading ? [] : groups).map((g) => (
          <View key={g.title} style={{ gap: 12 }}>
            <View style={{ paddingTop: 8, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="bodyS" weight={600} color="textBody" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {g.title}
              </Text>
              {g.markAll ? (
                <Pressable onPress={readAllNotifs} accessibilityRole="button" hitSlop={8}>
                  <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
                    Mark all as read
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 16 }}>
              {g.items.map((n, i) => {
                const acts = actions(n);
                return (
                  <View key={n.id} style={{ flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: i < g.items.length - 1 ? 1 : 0, borderColor: c.divider }}>
                    <Avatar n={n} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Pressable onPress={() => open(n, target(n))} accessibilityRole="link" accessibilityLabel={`${n.unread ? 'New. ' : ''}${n.title}`}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                          <Text variant="body" weight={n.unread ? 700 : 600} style={{ flex: 1, fontSize: 15, lineHeight: 20 }}>
                            {n.title}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <Text variant="caption" weight={400} color="textLightSecondary">
                              {n.time}
                            </Text>
                            {n.unread ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary }} /> : null}
                          </View>
                        </View>
                        <Text variant="body" color="textBody" style={{ marginTop: 3, fontSize: 14, lineHeight: 20 }}>
                          {n.text}
                        </Text>
                        {n.quote ? (
                          <View style={{ marginTop: 8, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: c.surfaceInset }}>
                            <Text variant="body" color="textPrimary" style={{ fontSize: 14, lineHeight: 20 }}>
                              {n.quote}
                            </Text>
                          </View>
                        ) : null}
                        {n.stack ? (
                          <View style={{ flexDirection: 'row', marginTop: 10 }}>
                            {n.stack.map((id, k) => {
                              const v = findVacancy(id);
                              return v ? (
                                <Image key={id} source={v.cover} contentFit="cover" style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 2, borderColor: c.surface, marginLeft: k ? -8 : 0, backgroundColor: c.backDarker }} />
                              ) : null;
                            })}
                            {n.more ? (
                              <View style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 2, borderColor: c.surface, marginLeft: -8, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                                <Text variant="caption" weight={700} color="textPrimary">
                                  +{n.more}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        ) : null}
                      </Pressable>
                      {acts ? <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{acts}</View> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
