import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Text, useToast, type IconName } from '@/components';
import { initialsOf, useEmployer, type MyVacancy } from '@/data/employer';
import { asPublicVacancy } from '@/data/hiring';
import { Radio } from '@/features/hire/ui';
import { SheetHero } from '@/features/profile/ui';
import { ShareSheet } from '@/features/vacancies/ShareSheet';
import { useTheme, type Colors } from '@/theme';

type Sheet = 'menu' | 'urgent' | 'archive' | 'relaunch' | 'delete' | 'share';

const fmtDay = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
/** "20 Oct": a week from today, when a relaunched vacancy expires. */
const weekFromNow = () => fmtDay(new Date(Date.now() + 7 * 864e5));
const ARCHIVE_REASONS = [
  { key: 'hired', title: 'Hired through 919', sub: 'Mark who you hired on the next step', note: 'hired via 919' },
  { key: 'elsewhere', title: 'Hired elsewhere', sub: 'Found a candidate outside the app', note: 'hired elsewhere' },
  { key: 'cancelled', title: 'No longer needed', sub: 'The position was cancelled', note: 'not needed' },
] as const;

function Row({
  icon,
  tint,
  fg,
  title,
  sub,
  right,
  danger,
  onPress,
}: {
  icon: IconName;
  tint: keyof Colors;
  fg: keyof Colors;
  title: string;
  sub?: string;
  right?: ReactNode;
  danger?: boolean;
  onPress: () => void;
}) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c[tint], alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={20} color={fg} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyL" weight={600} color={danger ? 'dangerText' : 'textHeadline'} style={{ fontSize: 16 }}>
          {title}
        </Text>
        {sub ? (
          <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ fontSize: 13 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}

/** Things an employer does to their own vacancy (EmpHiringActions → EmpUrgentSheet / EmpCloseVacancy / EmpRelaunchSheet / delete / share).
 *  Returns `open(id, sheet?)` and the sheets to render once on the screen. */
export function useVacancyActions(opts: { onDeleted?: () => void } = {}) {
  const { c } = useTheme();
  const toast = useToast();
  const { vacancies, applicants, info, updateVacancy, removeVacancy } = useEmployer();
  const [id, setId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [reason, setReason] = useState<(typeof ARCHIVE_REASONS)[number]['key']>('hired');
  const v = vacancies.find((x) => x.id === id);

  const open = (vid: string, s: Sheet = 'menu') => {
    setId(vid);
    setReason('hired');
    setSheet(s);
  };
  const close = () => setSheet(null);

  const list = v ? (applicants[v.id] ?? []) : [];
  const fresh = list.filter((x) => x.status === 'new').length;
  const live = v?.status === 'active';
  const urgent = live && !!v?.urgentLeft;

  const statusLine = (x: MyVacancy) =>
    x.status === 'active'
      ? `Active · ${x.note.split(' · ')[0]}`
      : x.status === 'archive'
        ? `In archive · ${x.note}`
        : x.status === 'review'
          ? 'On review'
          : x.status === 'changes'
            ? 'Changes needed'
            : 'Rejected';

  const go = (s: Sheet) => setSheet(s);
  const payUrgent = () => {
    if (!v) return;
    updateVacancy(v.id, { urgentLeft: '24 h left', urgentInfo: { left: '24 h left · started just now', progress: 1, views: 0, applicants: 0 } });
    close();
    toast({ text: 'Urgent is on for 24 hours', kind: 'paid', icon: 'fire', aboveTabBar: true });
  };
  const archive = () => {
    if (!v) return;
    const r = ARCHIVE_REASONS.find((x) => x.key === reason)!;
    updateVacancy(v.id, { status: 'archive', note: `Closed ${fmtDay(new Date())} · ${r.note}`, urgentLeft: undefined, urgentInfo: undefined, daysLeft: undefined });
    close();
    toast({ text: 'Moved to archive. Waiting candidates got a notice', kind: 'neutral', icon: 'clock', aboveTabBar: true });
  };
  const relaunch = () => {
    if (!v) return;
    const until = weekFromNow();
    updateVacancy(v.id, { status: 'active', daysLeft: 7, note: `7 of 7 days left · until ${until}`, detail: v.detail && { ...v.detail, posted: 'Just now' } });
    close();
    toast({ text: `Relaunched · live until ${until}`, icon: 'flash', aboveTabBar: true });
  };
  const remove = () => {
    if (!v) return;
    close();
    opts.onDeleted?.();
    removeVacancy(v.id);
    toast({ text: 'Vacancy deleted', kind: 'neutral', icon: 'trash', aboveTabBar: true });
  };
  const edit = () => {
    close();
    if (v) router.push({ pathname: '/post/edit', params: { id: v.id } });
  };

  const sheets = v ? (
    <>
      {/* EmpHiringActions */}
      <BottomSheet visible={sheet === 'menu'} onClose={close}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={v.cover} contentFit="cover" style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: c.backDarker }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="bodyL" weight={700} numberOfLines={1} style={{ fontSize: 17 }}>
              {v.title}
            </Text>
            <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ fontSize: 13 }}>
              {statusLine(v)}
            </Text>
          </View>
        </View>
        <View>
          {live && !urgent ? (
            <Row
              icon="fire"
              tint="urgent"
              fg="onUrgent"
              title="Make urgent"
              sub="Top of the feed and a hot badge for 24 h"
              onPress={() => go('urgent')}
              right={
                <View style={{ height: 28, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.input, justifyContent: 'center' }}>
                  <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
                    $2.99
                  </Text>
                </View>
              }
            />
          ) : null}
          {live || v.status === 'archive' ? (
            <Row
              icon="users"
              tint="primarySecondary"
              fg="link"
              title="View applicants"
              sub={`${list.length} applicant${list.length === 1 ? '' : 's'}${fresh && live ? ` · ${fresh} new` : ''}`}
              onPress={() => (close(), router.navigate({ pathname: '/hire/applicants', params: { id: v.id } }))}
            />
          ) : null}
          <Row icon="edit" tint="primarySecondary" fg="link" title="Edit vacancy" sub="Changes go through moderation again" onPress={edit} />
          {live ? <Row icon="share" tint="primarySecondary" fg="link" title="Share vacancy" onPress={() => go('share')} /> : null}
          {live ? <Row icon="clock" tint="primarySecondary" fg="link" title="Move to archive" sub="Stop receiving applicants before day 7" onPress={() => go('archive')} /> : null}
          {v.status === 'archive' ? (
            <Row icon="flash" tint="primarySecondary" fg="link" title="Relaunch for 7 days" sub="Publish it again, applicants and chats stay" onPress={() => go('relaunch')} />
          ) : null}
          <Row icon="trash" tint="dangerBack" fg="dangerText" danger title="Delete vacancy" sub="Applicants and chats will be removed" onPress={() => go('delete')} />
        </View>
      </BottomSheet>

      {/* EmpUrgentSheet */}
      <BottomSheet visible={sheet === 'urgent'} onClose={close}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="fire" size={30} color="onUrgent" />
          </View>
          <Text variant="title" align="center">
            Urgent hiring for 24 hours
          </Text>
          <Text variant="body" color="textBody" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
            “{v.title}” goes to the top and gets candidates’ attention first.
          </Text>
        </View>
        {(
          [
            ['sort', 'Top of every list', 'Pinned above other vacancies in the feed and search'],
            ['fire', 'Hot badge', 'An Urgent badge on the vacancy and its card'],
            ['filter', 'Urgent tab in filters', 'Candidates who need a job now see it in a separate tab'],
          ] as [IconName, string, string][]
        ).map(([ic, t, s]) => (
          <View key={t} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={ic} size={18} color="textHeadline" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight={700} style={{ fontSize: 15 }}>
                {t}
              </Text>
              <Text variant="bodyS" color="textBody" style={{ fontSize: 13, lineHeight: 18 }}>
                {s}
              </Text>
            </View>
          </View>
        ))}
        <View style={{ padding: 14, borderRadius: 16, backgroundColor: c.input, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text variant="body" weight={700} style={{ fontSize: 15 }}>
              One-time · 24 hours
            </Text>
            <Text variant="caption" weight={400} color="textBody" style={{ fontSize: 12 }}>
              Starts right after payment
            </Text>
          </View>
          <Text variant="displayM" style={{ fontSize: 20 }}>
            $2.99
          </Text>
        </View>
        <Pressable onPress={payUrgent} accessibilityRole="button" style={{ height: 56, borderRadius: 18, backgroundColor: c.inverse, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="bodyL" weight={700} color="onInverse" style={{ fontSize: 16 }}>
            Pay with Apple Pay
          </Text>
        </Pressable>
        <Pressable onPress={close} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: 6 }}>
          <Text variant="body" weight={700} color="textBody">
            Not now
          </Text>
        </Pressable>
        <Text variant="caption" weight={400} color="textLightSecondary" align="center" style={{ fontSize: 11 }}>
          Charged to your Apple ID. Not a subscription — it won’t renew.
        </Text>
      </BottomSheet>

      {/* EmpCloseVacancy */}
      <BottomSheet visible={sheet === 'archive'} onClose={close}>
        <View style={{ gap: 8 }}>
          <Text variant="title">Move “{v.title}” to archive?</Text>
          <Text variant="body" color="textBody" style={{ fontSize: 14, lineHeight: 21 }}>
            It stops receiving applicants now instead of after 7 days. You can relaunch it from Archive any time.
          </Text>
        </View>
        <View>
          <Text variant="caption" weight={700} color="textBody" style={{ fontSize: 12, letterSpacing: 0.6, marginBottom: 2 }}>
            WHY ARE YOU ARCHIVING IT?
          </Text>
          {ARCHIVE_REASONS.map((r, i) => (
            <Pressable
              key={r.key}
              onPress={() => setReason(r.key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: reason === r.key }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderColor: c.divider }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyL" weight={600} style={{ fontSize: 16 }}>
                  {r.title}
                </Text>
                <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                  {r.sub}
                </Text>
              </View>
              <Radio on={reason === r.key} />
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, backgroundColor: c.input }}>
          <Icon name="notification" size={18} color="textBody" />
          <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>
            Candidates who are still waiting will get a polite notice that the vacancy is closed.
          </Text>
        </View>
        <Button size="l" label="Move to archive" onPress={archive} />
        <Button size="l" variant="neutral" label="Cancel" onPress={close} />
      </BottomSheet>

      {/* EmpRelaunchSheet */}
      <BottomSheet visible={sheet === 'relaunch'} onClose={close}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={v.cover} contentFit="cover" style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: c.backDarker }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="title" style={{ fontSize: 19 }}>
              Relaunch for 7 days?
            </Text>
            <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ fontSize: 13 }}>
              {v.title}
            </Text>
          </View>
        </View>
        <View>
          {(
            [
              ['calendar', `Live until ${weekFromNow()}`, 'Goes live right away, 7 days from today'],
              ['users', `${list.length} applicant${list.length === 1 ? '' : 's'} and their chats stay`, 'New applicants are added to the same list'],
              ['edit', 'Same details as before', 'Edit first if pay, dates or venue changed'],
            ] as [IconName, string, string][]
          ).map(([ic, t, s], i) => (
            <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderColor: c.divider }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={ic} size={20} color="link" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight={700} style={{ fontSize: 15 }}>
                  {t}
                </Text>
                <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                  {s}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <Button size="l" icon="flash" label="Relaunch" onPress={relaunch} />
        <Button size="l" variant="neutral" label="Edit and relaunch" onPress={edit} />
      </BottomSheet>

      {/* Delete */}
      <BottomSheet visible={sheet === 'delete'} onClose={close}>
        <SheetHero
          icon="trash"
          tone="danger"
          title="Delete this vacancy?"
          text={`“${v.title}” disappears from the feed and search${list.length ? `, and its ${list.length} applicant${list.length === 1 ? '' : 's'} get a notice that it’s closed` : ''}. This can’t be undone.`}
        />
        <Button size="l" variant="destructive" label="Delete vacancy" onPress={remove} />
        <Button size="l" variant="neutral" label="Cancel" onPress={close} />
      </BottomSheet>

      {v.detail ? <ShareSheet v={asPublicVacancy(v, v.detail, { name: info.name, initials: initialsOf(info.name) })} visible={sheet === 'share'} onClose={close} /> : null}
    </>
  ) : null;

  return { open, sheets };
}
