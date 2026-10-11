import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, EmptyState, Icon, Pressable, SegmentedTabs, StatusChip, TAB_BAR_SPACE, Text, type StatusKind } from '@/components';
import { contractTypes, formatAmount } from '@/data/dictionaries';
import { findVacancy } from '@/data/mock';
import { useSeeker, type AppStatus, type Application } from '@/data/seeker';
import type { Vacancy } from '@/data/types';
import { SaveButton } from '@/features/vacancies/SaveButton';
import { useApply } from '@/features/vacancies/useApply';
import { useTheme } from '@/theme';

type Tab = 'applied' | 'saved' | 'active' | 'archive';
type Filter = 'all' | 'pending' | 'accepted' | 'declined';

const statusChip: Record<AppStatus, { kind: StatusKind; label: string; icon?: 'check' | 'cancel' | 'clock' }> = {
  pending: { kind: 'pending', label: 'Pending' },
  accepted: { kind: 'success', label: 'Accepted', icon: 'check' },
  declined: { kind: 'danger', label: 'Declined', icon: 'cancel' },
  hired: { kind: 'success', label: 'Hired', icon: 'check' },
  closed: { kind: 'closed', label: 'Closed', icon: 'clock' },
};

function Card({ v, right, footer }: { v: Vacancy; right?: ReactNode; footer: ReactNode }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={() => router.push({ pathname: '/vacancy/[id]', params: { id: v.id } })} accessibilityRole="button" accessibilityLabel={v.title} style={{ backgroundColor: c.surface, borderRadius: 20, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Image source={v.cover} contentFit="cover" style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: c.backDarker }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="body" weight={700} numberOfLines={1}>
            {v.title}
          </Text>
          <Text variant="bodyS" color="textBody">
            {v.company.name} · {v.city}
          </Text>
          <Text variant="body" weight={700} style={{ fontSize: 14, marginTop: 2 }}>
            {v.pay.currency} {formatAmount(v.pay.amount)}{' '}
            <Text variant="bodyS" color="textBody">
              {contractTypes[v.pay.contract].suffix}
            </Text>
          </Text>
        </View>
        {right}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10, borderTopWidth: 1, borderColor: c.divider }}>{footer}</View>
    </Pressable>
  );
}

function ChatLink({ id }: { id?: string }) {
  if (!id) return null;
  return (
    <Pressable onPress={() => router.push({ pathname: '/chat/[id]', params: { id } })} accessibilityRole="button" hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name="message" size={16} color="link" />
      <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
        Chat
      </Text>
    </Pressable>
  );
}

function AppFooter({ a }: { a: Application }) {
  const s = statusChip[a.status];
  return (
    <>
      <StatusChip kind={s.kind} label={s.label} icon={s.icon} />
      <Text variant="bodyS" color="textBody" style={{ flex: 1 }} numberOfLines={1}>
        {a.note}
      </Text>
      {a.status === 'accepted' ? <ChatLink id={a.chatId} /> : null}
    </>
  );
}

/** My vacancies — Applied (with status filter), Saved, Active (hired) and Archive. */
export default function Applications() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { apps, saved, appFor } = useSeeker();
  const apply = useApply({ aboveTabBar: true });
  const [tab, setTab] = useState<Tab>('applied');
  const [filter, setFilter] = useState<Filter>('all');

  const live = apps.filter((a) => !a.archived && a.status !== 'hired');
  const count = (f: Filter) => (f === 'all' ? live.length : live.filter((a) => a.status === f).length);
  const applied = live.filter((a) => filter === 'all' || a.status === filter);
  const active = apps.filter((a) => a.status === 'hired' && !a.archived);
  const archive = apps.filter((a) => a.archived);
  const savedList = saved.map(findVacancy).filter(Boolean) as Vacancy[];

  const empty = (icon: 'briefcase' | 'bookmark' | 'clock', title: string, text: string, browse = true) => (
    <EmptyState icon={icon} title={title} text={text} passive={!browse} action={browse ? { label: 'Browse vacancies', icon: 'search', onPress: () => router.navigate('/seeker') } : undefined} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, gap: 14, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <Text variant="displayL" accessibilityRole="header" style={{ fontSize: 24, lineHeight: 30 }}>
          Applications
        </Text>
        <SegmentedTabs<Tab>
          items={[
            { key: 'applied', label: 'Applied' },
            { key: 'saved', label: 'Saved' },
            { key: 'active', label: 'Active' },
            { key: 'archive', label: 'Archive' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        {tab === 'applied' ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginHorizontal: -20 }}>
              <View style={{ width: 12 }} />
              {(['all', 'pending', 'accepted', 'declined'] as Filter[]).map((f) => (
                <Chip key={f} label={f[0].toUpperCase() + f.slice(1)} count={count(f)} check={f === 'all'} selected={filter === f} onPress={() => setFilter(f)} />
              ))}
              <View style={{ width: 12 }} />
            </ScrollView>
            {applied.length
              ? applied.map((a) => {
                  const v = findVacancy(a.vacancyId);
                  return v ? <Card key={a.vacancyId} v={v} footer={<AppFooter a={a} />} /> : null;
                })
              : empty('briefcase', filter === 'all' ? 'No applications yet' : `No ${filter} applications`, 'Apply to vacancies that fit you and track every status here — pending, accepted or declined.')}
          </>
        ) : null}

        {tab === 'saved' ? (
          savedList.length ? (
            <>
              <Text variant="bodyS" color="textBody">
                {savedList.length} saved vacanc{savedList.length === 1 ? 'y' : 'ies'} · we will remind you before they close
              </Text>
              {savedList.map((v, i) => (
                <Card
                  key={v.id}
                  v={v}
                  right={<SaveButton vacancyId={v.id} />}
                  footer={
                    <>
                      <Text variant="bodyS" color={i === 0 ? 'attentionText' : 'textBody'} style={{ flex: 1 }}>
                        {i === 0 ? 'Closes in 2 days' : `Posted ${v.postedAgo.toLowerCase()}`}
                      </Text>
                      {appFor(v.id) ? (
                        <Text variant="bodyS" weight={600} color="textBody">
                          Applied
                        </Text>
                      ) : (
                        <Pressable onPress={() => apply.respond(v.id)} accessibilityRole="button" accessibilityLabel={`Apply to ${v.title}`} hitSlop={10}>
                          <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
                            Apply
                          </Text>
                        </Pressable>
                      )}
                    </>
                  }
                />
              ))}
            </>
          ) : (
            empty('bookmark', 'Nothing saved yet', 'Tap the bookmark on a vacancy to keep it here. We’ll remind you before it closes.')
          )
        ) : null}

        {tab === 'active' ? (
          active.length ? (
            <>
              <Text variant="bodyS" color="textBody">
                Jobs you were hired for
              </Text>
              {active.map((a) => {
                const v = findVacancy(a.vacancyId);
                return v ? (
                  <Card
                    key={a.vacancyId}
                    v={v}
                    right={<StatusChip kind="success" label="Hired" icon="check" />}
                    footer={
                      <>
                        <Icon name="calendar" size={16} color="textBody" />
                        <Text variant="bodyS" weight={700} style={{ flex: 1 }}>
                          {a.note}
                        </Text>
                        <ChatLink id={a.chatId} />
                      </>
                    }
                  />
                ) : null;
              })}
            </>
          ) : (
            empty('briefcase', 'No active jobs', 'When an employer hires you, the job and its schedule show up here.')
          )
        ) : null}

        {tab === 'archive' ? (
          archive.length ? (
            <>
              <Text variant="bodyS" color="textBody">
                Closed vacancies and finished jobs
              </Text>
              {archive.map((a) => {
                const v = findVacancy(a.vacancyId);
                return v ? <Card key={a.vacancyId} v={v} footer={<AppFooter a={a} />} /> : null;
              })}
            </>
          ) : (
            empty('clock', 'Archive is empty', 'Closed vacancies and finished jobs move here automatically.', false)
          )
        ) : null}
      </ScrollView>
      {apply.sheets}
    </View>
  );
}
