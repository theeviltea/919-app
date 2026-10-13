import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Icon, IconButton, Pressable, Text, useToast, type IconName } from '@/components';
import { useEmployer, type EmpNotif, type EmpNotifKind } from '@/data/employer';
import { useSoon } from '@/features/hire/ui';
import { useStartVacancy } from '@/features/post/gate';
import { useTheme, type Colors } from '@/theme';

type Filter = 'all' | EmpNotif['group'];

/** Small status badge on a photo or a vacancy cover. */
const badges: Partial<Record<EmpNotifKind, { icon: IconName; bg: keyof Colors; fg?: string }>> = {
  applicants: { icon: 'user', bg: 'primary' },
  applicant: { icon: 'user', bg: 'primary' },
  accepted: { icon: 'check', bg: 'successStrong' },
  changes: { icon: 'edit', bg: 'urgent', fg: '#18191C' },
  approved: { icon: 'check', bg: 'successStrong' },
  rejected: { icon: 'cancel', bg: 'dangerText' },
  declined: { icon: 'cancel', bg: 'textLightSecondary' },
};
/** Square icon tiles for notifications without a picture. */
const tiles: Partial<Record<EmpNotifKind, { icon: IconName; bg: keyof Colors; fg: keyof Colors }>> = {
  urgent: { icon: 'fire', bg: 'urgent', fg: 'onUrgent' },
  expires: { icon: 'clock', bg: 'input', fg: 'textBody' },
  premiumSoon: { icon: 'star', bg: 'labelOrangeBack', fg: 'labelOrangeText' },
  archived: { icon: 'briefcase', bg: 'input', fg: 'textBody' },
  premiumOver: { icon: 'star', bg: 'input', fg: 'textBody' },
};

function Avatar({ n }: { n: EmpNotif }) {
  const { c } = useTheme();
  const tile = tiles[n.kind];
  if (tile || !(n.photo || n.cover)) {
    const t = tile ?? { icon: 'notification' as IconName, bg: 'input' as keyof Colors, fg: 'textBody' as keyof Colors };
    return (
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c[t.bg], alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={t.icon} size={22} color={t.fg} />
      </View>
    );
  }
  const b = badges[n.kind];
  return (
    <View style={{ width: 44, height: 44 }}>
      <Image source={n.photo ?? n.cover} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.backDarker }} />
      {b ? (
        <View
          style={{
            position: 'absolute',
            right: -3,
            bottom: -3,
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: c.surface,
            backgroundColor: c[b.bg],
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name={b.icon} size={10} color={b.fg ?? '#FFFFFF'} />
        </View>
      ) : null}
    </View>
  );
}

const FILTERS: [Filter, string][] = [
  ['all', 'All'],
  ['applicants', 'Applicants'],
  ['vacancies', 'Vacancies'],
  ['messages', 'Messages'],
  ['subscription', 'Subscription'],
];

/** Employer notification center (EmpNotificationCenter / Empty): new first, then Today and Earlier. */
export default function EmployerNotifications() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const soon = useSoon();
  const { notifs, readNotif, readAllNotifs } = useEmployer();
  const startVacancy = useStartVacancy();
  const [filter, setFilter] = useState<Filter>('all');

  const shown = notifs.filter((n) => filter === 'all' || n.group === filter);
  const groups: { title: string; items: EmpNotif[]; markAll?: boolean }[] = [
    { title: `New · ${shown.filter((n) => n.unread).length}`, items: shown.filter((n) => n.unread), markAll: true },
    { title: 'Today', items: shown.filter((n) => !n.unread && n.day === 'today') },
    { title: 'Earlier', items: shown.filter((n) => !n.unread && n.day === 'earlier') },
  ].filter((g) => g.items.length);
  const count = (f: Filter) => notifs.filter((n) => n.group === f).length;

  /** Where a notification leads (its action and a tap on it). */
  const go = (n: EmpNotif) => {
    readNotif(n.id);
    switch (n.kind) {
      case 'applicants':
      case 'applicant':
      case 'urgent':
      case 'approved':
      case 'archived':
        return router.navigate('/hire/vacancies');
      case 'accepted':
      case 'declined':
        return router.navigate('/hire/messages');
      case 'expires':
        return toast({ text: 'Promo model, car launch relaunched for 7 days', icon: 'flash' });
      case 'premiumSoon':
      case 'premiumOver':
        return router.push('/company/subscription');
      default:
        return soon('Vacancy editing');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: insets.bottom + 40, gap: 12, flexGrow: 1, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <BackButton onPress={() => (router.canGoBack() ? router.back() : router.navigate('/hire'))} />
          <Text variant="bodyL" weight={700} align="center" accessibilityRole="header" style={{ flex: 1, fontSize: 17 }}>
            Notifications
          </Text>
          <IconButton icon="settings" label="Notification settings" onPress={() => router.push('/profile/notifications')} />
        </View>

        {notifs.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginHorizontal: -16, marginTop: 4 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            {FILTERS.map(([k, label]) => {
              const on = filter === k;
              const n = k === 'all' ? 0 : count(k);
              return (
                <Pressable
                  key={k}
                  onPress={() => setFilter(k)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  style={{
                    height: 36,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    borderWidth: on ? 0 : 1,
                    borderColor: c.stroke,
                    backgroundColor: on ? c.inverse : c.surface,
                    justifyContent: 'center',
                  }}>
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

        {groups.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 72, paddingHorizontal: 24 }}>
            <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="notification" size={36} color="primary" />
            </View>
            <Text variant="title" align="center" style={{ marginTop: 20 }}>
              {filter === 'all' ? 'No notifications yet' : 'Nothing here yet'}
            </Text>
            <Text variant="body" color="textBody" align="center" style={{ marginTop: 10, fontSize: 14, lineHeight: 21 }}>
              Here you’ll see new applicants, replies to contact requests, moderation results and reminders about your vacancies and subscription.
            </Text>
            <Pressable
              onPress={startVacancy}
              accessibilityRole="button"
              style={{ marginTop: 24, height: 48, paddingHorizontal: 20, borderRadius: 16, backgroundColor: c.primarySecondary, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="add" size={18} color="link" />
              <Text variant="body" weight={700} color="link" style={{ fontSize: 15 }}>
                Post a vacancy
              </Text>
            </Pressable>
          </View>
        ) : null}

        {groups.map((g) => (
          <View key={g.title} style={{ gap: 12 }}>
            <View style={{ paddingTop: 8, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="bodyS" weight={600} color="textBody" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {g.title}
              </Text>
              {g.markAll ? (
                <Pressable onPress={readAllNotifs} accessibilityRole="button" hitSlop={8}>
                  <Text variant="body" weight={700} style={{ fontSize: 14 }}>
                    Mark all as read
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 16 }}>
              {g.items.map((n, i) => (
                <View key={n.id} style={{ flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: i < g.items.length - 1 ? 1 : 0, borderColor: c.divider }}>
                  <Avatar n={n} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Pressable onPress={() => go(n)} accessibilityRole="link" accessibilityLabel={`${n.unread ? 'New. ' : ''}${n.title}`}>
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
                    </Pressable>
                    {n.action ? (
                      <View style={{ marginTop: 10, flexDirection: 'row' }}>
                        <Pressable
                          onPress={() => go(n)}
                          accessibilityRole="button"
                          style={{ height: 36, paddingHorizontal: 14, borderRadius: 12, backgroundColor: n.unread ? c.primary : c.input, justifyContent: 'center' }}>
                          <Text variant="bodyS" weight={700} color={n.unread ? 'ctaButtonText' : 'textHeadline'} style={{ fontSize: 13 }}>
                            {n.action}
                          </Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
