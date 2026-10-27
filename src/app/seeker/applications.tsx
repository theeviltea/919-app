import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, EmptyState, Icon, Pressable, SegmentedTabs, StatusChip, TAB_BAR_SPACE, Text, useToast, type StatusKind } from '@/components';
import { contractTypes, formatAmount } from '@/data/dictionaries';
import { findVacancy } from '@/data/mock';
import { hireAnswerLabel, useSeeker, type AppStatus, type Application, type HireAnswer } from '@/data/seeker';
import type { Vacancy } from '@/data/types';
import { SeekApplicationsSkeleton } from '@/features/skeletons/SeekApplicationsSkeleton';
import { useFirstLoad } from '@/features/skeletons/useFirstLoad';
import { HireAnswerSheet } from '@/features/vacancies/HireAnswerSheet';
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

function Card({ v, right, footer, extra }: { v: Vacancy; right?: ReactNode; footer: ReactNode; extra?: ReactNode }) {
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
      {extra}
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

const answerChip: Record<'yes' | 'no' | 'process' | 'other', { kind: StatusKind; icon?: 'check' | 'cancel' | 'clock' }> = {
  yes: { kind: 'success', icon: 'check' },
  no: { kind: 'danger', icon: 'cancel' },
  process: { kind: 'attention', icon: 'clock' },
  other: { kind: 'pending' },
};

/** SeekApplicationsHireAsk: under an accepted application — ask "Did you get this job?", or show the answer (tap to change). */
function HireAsk({ a, onOpen }: { a: Application; onOpen: () => void }) {
  const { c } = useTheme();
  if (a.answer !== undefined) {
    const k = typeof a.answer === 'object' ? 'other' : a.answer;
    return (
      <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel="Change your answer" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <StatusChip kind={answerChip[k].kind} label={hireAnswerLabel(a.answer)} icon={answerChip[k].icon ?? null} />
        <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ flex: 1 }}>
          {typeof a.answer === 'object' ? `“${a.answer.other}”` : 'Your answer'}
        </Text>
        <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
          Change
        </Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel="Did you get this job? Answer"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, backgroundColor: c.primarySecondary }}>
      <Icon name="briefcase" size={22} color="primary" />
      <Text variant="body" weight={700} style={{ flex: 1, fontSize: 14 }}>
        Did you get this job?
      </Text>
      <View style={{ height: 32, paddingHorizontal: 12, borderRadius: 10, backgroundColor: c.primary, justifyContent: 'center' }}>
        <Text variant="bodyS" weight={700} color="ctaButtonText" style={{ fontSize: 13 }}>
          Answer
        </Text>
      </View>
    </Pressable>
  );
}

/** My vacancies — Applied (with status filter), Saved, Active (hired) and Archive. */
export default function Applications() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { apps, saved, appFor, answerHire, hireAskDone, setHireAskDone } = useSeeker();
  const toast = useToast();
  const params = useLocalSearchParams<{ ask?: string }>();
  const [ask, setAsk] = useState<string | null>(null);
  const apply = useApply({ aboveTabBar: true });
  const [tab, setTab] = useState<Tab>('applied');
  const [filter, setFilter] = useState<Filter>('all');
  const loading = useFirstLoad('seeker-applications');
  const askApp = ask ? appFor(ask) : undefined;
  const pendingAsk = apps.find((a) => a.status === 'accepted' && !a.archived && a.answer === undefined);

  // From the "Did you get the job?" notification (push in the real app): open its sheet.
  const [handledAsk, setHandledAsk] = useState<string | undefined>();
  if (params.ask && params.ask !== handledAsk) {
    setHandledAsk(params.ask);
    setTab('applied');
    setAsk(params.ask);
  }
  useEffect(() => {
    if (params.ask) router.setParams({ ask: undefined });
  }, [params.ask]);
  // Once per session, after the list loads: ask about an accepted application without an answer.
  useEffect(() => {
    if (loading || hireAskDone || ask || !pendingAsk) return;
    const t = setTimeout(() => setAsk(pendingAsk.vacancyId), 400);
    return () => clearTimeout(t);
  }, [loading, hireAskDone, ask, pendingAsk]);
  const closeAsk = () => {
    setAsk(null);
    setHireAskDone();
  };

  const sendAnswer = (answer: HireAnswer) => {
    if (!ask) return;
    answerHire(ask, answer);
    closeAsk();
    if (answer === 'yes') {
      setTab('active');
      toast({ text: 'Congratulations! The job is in Active now', icon: 'check' });
    } else toast({ text: 'Thanks, we saved your answer', icon: 'check' });
  };

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
        {loading && tab !== 'applied' ? <SeekApplicationsSkeleton /> : null}
        {tab === 'applied' ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginHorizontal: -20 }}>
              <View style={{ width: 12 }} />
              {(['all', 'pending', 'accepted', 'declined'] as Filter[]).map((f) => (
                <Chip key={f} label={f[0].toUpperCase() + f.slice(1)} count={count(f)} check={f === 'all'} selected={filter === f} onPress={() => setFilter(f)} />
              ))}
              <View style={{ width: 12 }} />
            </ScrollView>
            {loading ? (
              <SeekApplicationsSkeleton />
            ) : applied.length
              ? applied.map((a) => {
                  const v = findVacancy(a.vacancyId);
                  return v ? (
                    <Card key={a.vacancyId} v={v} footer={<AppFooter a={a} />} extra={a.status === 'accepted' ? <HireAsk a={a} onOpen={() => setAsk(a.vacancyId)} /> : undefined} />
                  ) : null;
                })
              : empty('briefcase', filter === 'all' ? 'No applications yet' : `No ${filter} applications`, 'Apply to vacancies that fit you and track every status here — pending, accepted or declined.')}
          </>
        ) : null}

        {!loading && tab === 'saved' ? (
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

        {!loading && tab === 'active' ? (
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

        {!loading && tab === 'archive' ? (
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
      <HireAnswerSheet
        key={ask ?? 'none'}
        v={askApp ? findVacancy(askApp.vacancyId) : undefined}
        acceptedOn={askApp?.acceptedOn}
        initial={askApp?.answer}
        visible={!!askApp}
        onClose={closeAsk}
        onLater={() => {
          closeAsk();
          toast({ text: 'We’ll ask again later. You can answer here any time', icon: 'clock', kind: 'neutral' });
        }}
        onSend={sendAnswer}
      />
    </View>
  );
}
