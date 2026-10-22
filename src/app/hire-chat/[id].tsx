import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, BottomSheet, Button, ChatBubble, ChatDate, ChatSystemLine, EmptyState, Icon, IconButton, type IconName, Pressable, Text, TierBadge, useToast } from '@/components';
import { profileOf } from '@/data/candidateProfile';
import { contractTypes, formatAmount } from '@/data/dictionaries';
import { candidateReplies, fallbackChat, type EmpMsg, type NewEmpMsg } from '@/data/empChat';
import { useEmployer, type EmpThread, type MyVacancy } from '@/data/employer';
import { findCandidate, type Candidate } from '@/data/talentPool';
import { tierOf } from '@/data/tiers';
import { SAMPLE_PHOTOS } from '@/features/auth/media';
import { pickImages } from '@/features/auth/pickImage';
import { ChatBackground } from '@/features/chat/ChatBackground';
import { Radio } from '@/features/hire/ui';
import { SwipeReply } from '@/features/chat/SwipeReply';
import { openPhotos, openVideo } from '@/features/media/viewer';
import { fontFamily, useTheme } from '@/theme';

type AttachKind = 'photo' | 'vacancy' | 'location' | 'contact';
type Sheet = 'menu' | 'attach' | 'pickVacancy' | 'block' | null;
type Quote = { author: string; text: string };

const BLOCK_REASONS = ['Rude or inappropriate behaviour', 'Spam or advertising', 'Suspicious or fake profile', 'Other'];
const SUGGESTIONS = ['Hi! Are you available this weekend?', 'We liked your video — can we talk?'];

const clock = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
/** "Hostess, rooftop lounge" → "Hostess, rooftop": the chip keeps the first two words. */
const shortTitle = (t: string) => t.split(' ').slice(0, 2).join(' ').replace(/,$/, '');
const quoteOf = (m: EmpMsg) =>
  m.kind === 'text' ? m.text : m.kind === 'photos' ? m.text || 'Photo' : m.kind === 'vacancy' ? 'Vacancy' : m.kind === 'location' ? 'Location' : m.kind === 'contact' ? 'Contact' : '';

function PhotoGrid({ photos }: { photos: ImageSourcePropType[] }) {
  const { c } = useTheme();
  const one = photos.length === 1;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3, borderRadius: 16, overflow: 'hidden' }}>
      {photos.slice(0, 4).map((p, i) => (
        <Pressable key={i} onPress={() => openPhotos({ photos, index: i })} accessibilityRole="imagebutton" accessibilityLabel={`Open photo ${i + 1}`}>
          <Image source={p} contentFit="cover" style={{ width: one ? 242 : 119.5, height: one ? 260 : 119.5, backgroundColor: c.backDarker }} />
        </Pressable>
      ))}
    </View>
  );
}

/** Vacancy card inside a bubble (EmpChat). */
function VacancyCard({ v }: { v: MyVacancy }) {
  const { c } = useTheme();
  const d = v.detail;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/my-vacancy/[id]', params: { id: v.id } })}
      accessibilityRole="link"
      accessibilityLabel={`Vacancy: ${v.title}`}
      style={{ width: 252, flexDirection: 'row', gap: 10, padding: 8, borderRadius: 16, backgroundColor: c.surface }}>
      <Image source={v.cover} contentFit="cover" style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: c.backDarker }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="briefcase" size={12} color="textBody" />
          <Text variant="caption" weight={600} color="textBody" style={{ fontSize: 11 }}>
            Vacancy
          </Text>
        </View>
        <Text variant="body" weight={700} numberOfLines={1} style={{ marginTop: 2, fontSize: 14 }}>
          {v.title}
        </Text>
        {d ? (
          <Text variant="caption" weight={400} color="textBody" style={{ marginTop: 2, fontSize: 12 }}>
            <Text variant="caption" weight={700} style={{ fontSize: 12 }}>
              {d.amount != null ? `${d.currency} ${formatAmount(d.amount)}` : 'Negotiable'}
            </Text>
            {d.amount != null ? ` ${contractTypes[d.contract].suffix}` : ''}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function InfoCard({ icon, title, sub, mine }: { icon: IconName; title: string; sub?: string; mine: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ width: 252, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 16, backgroundColor: mine ? c.surface : c.surfaceInset }}>
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={20} color="link" />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 14 }}>
          {title}
        </Text>
        {sub ? (
          <Text variant="caption" weight={400} color="textBody" numberOfLines={2} style={{ fontSize: 12 }}>
            {sub}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/** Candidate summary pinned on top of every context (EmpChat). */
function CandidateCard({ cand }: { cand: Candidate }) {
  const { c } = useTheme();
  const yrs = profileOf(cand).total.split(' ').slice(0, 2).join(' ').replace('yrs', 'years').replace('yr', 'year');
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/talent/[id]', params: { id: cand.id } })}
      accessibilityRole="link"
      accessibilityLabel={`Candidate profile: ${cand.name}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 20, backgroundColor: c.surface, boxShadow: '0 4px 16px rgba(14,26,43,0.08)' }}>
      <Pressable
        disabled={!cand.video}
        onPress={() =>
          cand.video &&
          openVideo({
            poster: cand.photo,
            duration: cand.video.duration,
            label: 'Video presentation',
            name: cand.name,
            tier: cand.tier,
            avatar: cand.photo,
            subtitle: `${cand.role} · ${cand.city}`,
          })
        }
        accessibilityRole="button"
        accessibilityLabel="Play video presentation">
        <Image source={cand.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 64, height: 64, borderRadius: 14, backgroundColor: c.backDarker }} />
        {cand.video ? (
          <View
            style={{
              position: 'absolute',
              left: 4,
              bottom: 4,
              height: 20,
              paddingHorizontal: 6,
              borderRadius: 999,
              backgroundColor: 'rgba(24,25,27,0.6)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
            }}>
            <Icon name="play-filled" size={9} color="#FFFFFF" />
            <Text variant="caption" weight={700} color="#FFFFFF" style={{ fontSize: 10 }}>
              {cand.video.duration}
            </Text>
          </View>
        ) : null}
      </Pressable>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Icon name="user" size={13} color="textBody" />
          <Text variant="caption" weight={600} color="textBody" style={{ fontSize: 12 }}>
            Candidate
          </Text>
        </View>
        <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15 }}>
          {cand.role.split(',')[0]}
          {yrs ? ` · ${yrs}` : ''}
        </Text>
        <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ fontSize: 13 }}>
          {cand.languages.join(', ')} · {cand.city} · {cand.age} y.o.
        </Text>
      </View>
      <Icon name="chevron-right" size={18} color="textLightSecondary" />
    </Pressable>
  );
}

/** Employer ↔ candidate chat (EmpChat / Attach / New / Direct / Menu / Block / Blocked / Declined / Deleted / RequestPending / RequestAccepted). */
export default function EmployerChat() {
  const { id, ctx: ctxParam } = useLocalSearchParams<{ id: string; ctx?: string }>();
  const { threads } = useEmployer();
  const t = threads.find((x) => x.id === id);
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  if (!t) {
    return (
      <View style={{ flex: 1, backgroundColor: c.back, paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
        <BackButton />
        <EmptyState icon="message" title="Chat not found" text="It may have been deleted." passive />
      </View>
    );
  }
  return <Chat key={t.id} t={t} initialCtx={ctxParam} />;
}

function Chat({ t, initialCtx }: { t: EmpThread; initialCtx?: string }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { vacancies, applicants, info, sendChat, updateThread, acceptApplicant, declineApplicant, setApplicant } = useEmployer();
  const cand = t.candidateId ? findCandidate(t.candidateId) : undefined;
  const first = t.name.split(' ')[0];

  // Contexts: Direct, then one per vacancy (by title in the thread, or by key in its chats).
  const vacIds = [
    ...(t.vacancies ?? []).map((title) => vacancies.find((v) => v.title === title)?.id).filter((x): x is string => !!x),
    ...Object.keys(t.chats ?? {}).filter((k) => k !== 'direct'),
  ].filter((x, i, a) => a.indexOf(x) === i);
  const contexts = [...(t.direct || t.chats?.direct ? ['direct'] : []), ...vacIds];
  const [ctx, setCtx] = useState(initialCtx && contexts.includes(initialCtx) ? initialCtx : (vacIds[0] ?? 'direct'));
  const [text, setText] = useState('');
  const [inputH, setInputH] = useState(22);
  const [reply, setReply] = useState<Quote | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [blockReason, setBlockReason] = useState(BLOCK_REASONS[0]);
  const [typing, setTyping] = useState(false);
  const [undo, setUndo] = useState<string | null>(null);
  const scroll = useRef<ScrollView>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const unread = t.unread;
  useEffect(() => {
    if (unread) updateThread(t.id, () => ({ unread: 0 }));
  }, [t.id, unread, updateThread]);

  const statusOf = (vid: string) => (t.candidateId ? applicants[vid]?.find((x) => x.candidateId === t.candidateId)?.status : undefined);
  const vacOf = (vid: string) => vacancies.find((v) => v.id === vid);
  const messages: EmpMsg[] = t.chats?.[ctx] ?? (ctx === 'direct' || !t.chats ? fallbackChat(t.name, t.last, t.mine, t.time, ctx === 'direct') : []);
  const talked = messages.some((m) => m.kind === 'text' || m.kind === 'photos' || m.kind === 'vacancy' || m.kind === 'location' || m.kind === 'contact');
  const deleted = t.state === 'deleted';
  const blocked = t.state === 'blocked';
  const pending = ctx === 'direct' && t.request === 'pending';
  const declinedHere = ctx !== 'direct' && statusOf(ctx) === 'declined';
  const canWrite = !deleted && !blocked && !pending && !declinedHere;
  const pendingApps = vacIds.filter((vid) => vid !== ctx && statusOf(vid) === 'new');
  const role = cand ? `${cand.role.split(',')[0]}, ${cand.city}` : (t.subtitle ?? '');

  const push = (msg: NewEmpMsg, answer = true) => {
    sendChat(t.id, ctx, msg);
    setReply(null);
    if (answer && t.online && !deleted) {
      setTyping(true);
      timers.current.push(
        setTimeout(() => {
          setTyping(false);
          sendChat(t.id, ctx, { kind: 'text', mine: false, text: candidateReplies[Math.floor(Math.random() * candidateReplies.length)], time: clock() });
        }, 1800),
      );
    }
  };
  const submit = (body = text) => {
    const b = body.trim();
    if (!b) return;
    push({ kind: 'text', mine: true, text: b, time: clock(), quote: reply ?? undefined });
    setText('');
    setInputH(22);
  };
  const attachPhotos = async (sample: boolean) => {
    setSheet(null);
    const photos = sample ? [SAMPLE_PHOTOS[0], SAMPLE_PHOTOS[3]] : await pickImages({ multiple: true, limit: 4 });
    if (photos.length) push({ kind: 'photos', mine: true, photos, time: clock() });
  };

  const attach = (kind: AttachKind) => {
    if (kind === 'photo') return attachPhotos(false);
    if (kind === 'vacancy') return setSheet('pickVacancy');
    setSheet(null);
    if (kind === 'location') push({ kind: 'location', mine: true, title: info.name, address: info.office, time: clock() }, false);
    else push({ kind: 'contact', mine: true, name: info.name, phone: info.phone, email: info.email, time: clock() }, false);
  };

  const decline = () => {
    if (ctx === 'direct') return;
    setSheet(null);
    declineApplicant(ctx, t.candidateId!);
    sendChat(t.id, ctx, { kind: 'event', tone: 'danger', text: 'You declined the application', time: clock() });
    setUndo(ctx);
    timers.current.push(setTimeout(() => setUndo(null), 6000));
  };
  const undoDecline = () => {
    if (!undo) return;
    setApplicant(undo, t.candidateId!, 'accepted');
    sendChat(t.id, undo, { kind: 'event', tone: 'success', text: 'You restored the application', time: clock() });
    setUndo(null);
  };
  const block = () => {
    setSheet(null);
    updateThread(t.id, () => ({ state: 'blocked', box: 'inactive', reason: 'Blocked' }));
    sendChat(t.id, ctx, { kind: 'event', tone: 'danger', icon: 'lock', text: `You blocked ${first}`, time: clock() });
    toast({ text: `${t.name} is blocked`, kind: 'neutral', icon: 'lock' });
  };
  const unblock = () => {
    updateThread(t.id, () => ({ state: undefined, box: 'active', reason: undefined }));
    toast({ text: `${t.name} is unblocked`, kind: 'neutral', icon: 'check' });
  };
  const acceptOther = (vid: string) => {
    acceptApplicant(vid, t.candidateId!);
    setCtx(vid);
    toast({ text: `${first} accepted for ${vacOf(vid)?.title}`, icon: 'check' });
  };

  const otherOpen = contexts.filter((k) => k !== ctx && (k === 'direct' || statusOf(k) !== 'declined'));
  const ctxLabel = (k: string) => (k === 'direct' ? 'Direct' : shortTitle(vacOf(k)?.title ?? 'Vacancy'));
  const activeVacancies = vacancies.filter((v) => v.status === 'active');

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.back }}>
      {/* header */}
      <View style={{ paddingTop: insets.top + 8, paddingBottom: 10, backgroundColor: c.surfacePanel, borderBottomWidth: 1, borderColor: c.divider, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12 }}>
          <BackButton onPress={() => (router.canGoBack() ? router.back() : router.navigate('/hire/messages'))} />
          <Pressable
            disabled={!cand || deleted}
            onPress={() => cand && router.push({ pathname: '/talent/[id]', params: { id: cand.id } })}
            accessibilityRole="link"
            style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View>
              {deleted ? (
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="user" size={22} color="textBody" />
                </View>
              ) : (
                <Image source={t.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.backDarker }} />
              )}
              {t.online && !deleted && !blocked ? (
                <View style={{ position: 'absolute', right: 0, bottom: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2.5, borderColor: c.surface, backgroundColor: c.success }} />
              ) : null}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text variant="bodyL" weight={700} color={deleted ? 'textBody' : 'textHeadline'} numberOfLines={1} style={{ fontSize: 16, flexShrink: 1 }} accessibilityRole="header">
                  {t.name}
                </Text>
                <TierBadge tier={cand?.tier ?? tierOf(t.name)} size={18} />
              </View>
              <Text variant="caption" weight={400} color={typing ? 'link' : 'textBody'} numberOfLines={1} style={{ fontSize: 12 }}>
                {deleted
                  ? 'Account deleted'
                  : typing
                    ? 'typing…'
                    : pending
                      ? 'Direct · contact request'
                      : blocked
                        ? role
                        : `${t.online ? 'online' : 'last seen today'} · ${ctx === 'direct' && !vacIds.length ? 'Direct' : role}`}
              </Text>
            </View>
          </Pressable>
          <IconButton icon="more" label="Chat menu" onPress={() => setSheet('menu')} tone="filled" size={40} />
        </View>
        {contexts.length > 1 || vacIds.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 12 }}>
            {contexts.map((k) => {
              const on = k === ctx;
              const st = k === 'direct' ? undefined : statusOf(k);
              return (
                <Pressable
                  key={k}
                  onPress={() => (setCtx(k), setReply(null))}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={k === 'direct' ? 'Direct' : vacOf(k)?.title}
                  style={{ height: 32, maxWidth: 240, paddingHorizontal: 12, borderRadius: 999, backgroundColor: on ? c.inverse : c.input, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name={k === 'direct' ? 'message' : 'briefcase'} size={15} color={on ? 'onInverse' : 'textHeadline'} />
                  <Text variant="bodyS" weight={on ? 700 : 600} color={on ? 'onInverse' : 'textHeadline'} numberOfLines={1} style={{ fontSize: 13, flexShrink: 1 }}>
                    {ctxLabel(k)}
                  </Text>
                  {st ? (
                    <Text
                      variant="caption"
                      weight={700}
                      color={on ? 'onInverse' : st === 'accepted' ? 'successText' : st === 'declined' ? 'dangerText' : 'link'}
                      style={{ fontSize: 11, opacity: on ? 0.7 : 1 }}>
                      · {st === 'new' ? 'New' : st === 'accepted' ? 'Accepted' : 'Declined'}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
      </View>

      {/* messages */}
      <View style={{ flex: 1 }}>
        <ChatBackground />
        <ScrollView
          ref={scroll}
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ padding: 12, gap: 8, flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center' }}
          keyboardShouldPersistTaps="handled">
          {cand && !deleted ? <CandidateCard cand={cand} /> : null}
          <View style={{ flex: 1, minHeight: 6 }} />

          {messages.map((m) => {
            if (m.kind === 'date') return <ChatDate key={m.id} label={m.label} />;
            if (m.kind === 'event') return <ChatSystemLine key={m.id} text={m.text} time={m.time} tone={m.tone} icon={m.icon} />;
            if (m.kind === 'link')
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setCtx(m.ctx)}
                  accessibilityRole="button"
                  style={{ alignSelf: 'center', height: 32, paddingHorizontal: 12, borderRadius: 999, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text variant="bodyS" weight={700} color="link" style={{ fontSize: 13 }}>
                    {m.text}
                  </Text>
                  <Icon name="chevron-right" size={14} color="link" />
                </Pressable>
              );
            const v = m.kind === 'vacancy' ? vacOf(m.vacancyId) : undefined;
            const attachment =
              m.kind === 'photos' ? (
                <PhotoGrid photos={m.photos} />
              ) : m.kind === 'vacancy' && v ? (
                <View style={{ padding: 2 }}>
                  <VacancyCard v={v} />
                </View>
              ) : m.kind === 'location' ? (
                <View style={{ padding: 2 }}>
                  <InfoCard icon="location" title={m.title} sub={m.address} mine={m.mine} />
                </View>
              ) : m.kind === 'contact' ? (
                <View style={{ padding: 2 }}>
                  <InfoCard icon="call" title={m.name} sub={[m.phone, m.email].filter(Boolean).join(' · ')} mine={m.mine} />
                </View>
              ) : undefined;
            return (
              <SwipeReply
                key={m.id}
                mine={m.mine}
                canReply={canWrite}
                onReply={() => setReply({ author: m.mine ? 'You' : first, text: quoteOf(m) })}
                onLongPress={() => quoteOf(m) && Clipboard.setStringAsync(quoteOf(m)).then(() => toast({ text: 'Copied', kind: 'neutral', icon: 'check' }))}>
                <ChatBubble mine={m.mine} text={m.kind === 'text' || m.kind === 'photos' ? m.text : undefined} time={m.time} quote={m.kind === 'text' ? m.quote : undefined} attachment={attachment} />
              </SwipeReply>
            );
          })}

          {!talked && canWrite ? (
            // EmpChatNew
            <View style={{ alignSelf: 'center', width: '100%', maxWidth: 340, padding: 18, borderRadius: 20, backgroundColor: c.surface, alignItems: 'center', gap: 8, marginTop: 8 }}>
              <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="message" size={26} color="primary" />
              </View>
              <Text variant="bodyL" weight={700} align="center">
                Start the conversation
              </Text>
              <Text variant="bodyS" color="textBody" align="center" style={{ fontSize: 13, lineHeight: 19 }}>
                {first} will get a notification. Say what the job is about or send a vacancy.
              </Text>
            </View>
          ) : null}
          {pending ? (
            <View style={{ alignSelf: 'center', width: '100%', maxWidth: 330, padding: 18, borderRadius: 20, backgroundColor: c.surfacePanel, alignItems: 'center', gap: 6, marginTop: 8 }}>
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="clock" size={24} color="textBody" />
              </View>
              <Text variant="body" weight={700} align="center" style={{ fontSize: 15 }}>
                Waiting for {first}
              </Text>
              <Text variant="bodyS" color="textBody" align="center" style={{ fontSize: 13, lineHeight: 19 }}>
                You can write as soon as {cand?.gender === 'male' ? 'he' : 'she'} accepts the request. We’ll notify you.
              </Text>
            </View>
          ) : null}

          {deleted ? (
            <View style={{ alignSelf: 'center', width: '100%', maxWidth: 340, padding: 18, borderRadius: 20, backgroundColor: c.surfacePanel, alignItems: 'center', gap: 6, marginTop: 8 }}>
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="user" size={24} color="textBody" />
              </View>
              <Text variant="body" weight={700} align="center" style={{ fontSize: 15 }}>
                {t.name} deleted their account
              </Text>
              <Text variant="bodyS" color="textBody" align="center" style={{ fontSize: 13, lineHeight: 19 }}>
                You can’t send messages in this chat anymore. The history stays here for your records.
              </Text>
            </View>
          ) : null}

          {typing ? (
            <View style={{ alignSelf: 'flex-start', paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.textLightSecondary, opacity: 0.5 + i * 0.25 }} />
              ))}
            </View>
          ) : null}

          {/* Another vacancy this candidate applied to and you haven't answered yet */}
          {!blocked && !deleted
            ? pendingApps.map((vid) => {
                const v = vacOf(vid)!;
                return (
                  <View key={vid} style={{ marginTop: 6, padding: 12, borderRadius: 20, backgroundColor: c.surface, gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Image source={v.cover} contentFit="cover" style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: c.backDarker }} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Icon name="user" size={13} color="link" />
                          <Text variant="caption" weight={600} color="link" style={{ fontSize: 12 }}>
                            New application
                          </Text>
                        </View>
                        <Text variant="body" weight={700} style={{ fontSize: 15 }}>
                          {first} also applied to {v.title}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Button
                          variant="neutral"
                          icon="cancel"
                          label="Decline"
                          onPress={() => (declineApplicant(vid, t.candidateId!), toast({ text: `Declined for ${v.title}`, kind: 'neutral', icon: 'cancel' }))}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button icon="check" label="Accept" onPress={() => acceptOther(vid)} />
                      </View>
                    </View>
                  </View>
                );
              })
            : null}
        </ScrollView>

        {undo ? (
          <View style={{ position: 'absolute', left: 12, right: 12, top: 12, padding: 12, borderRadius: 16, backgroundColor: c.inverse, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={14} color="onInverse" />
            </View>
            <Text variant="bodyS" weight={700} color="onInverse" style={{ flex: 1, fontSize: 13 }}>
              Declined for {vacOf(undo)?.title}. {first} got a polite notice.
            </Text>
            <Pressable onPress={undoDecline} accessibilityRole="button" hitSlop={8}>
              <Text variant="body" weight={700} color="#6AA8FF" style={{ fontSize: 14 }}>
                Undo
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* bottom */}
      <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: insets.bottom + 10, backgroundColor: c.surfacePanel, borderTopWidth: 1, borderColor: c.divider }}>
        <View style={{ width: '100%', maxWidth: 720, alignSelf: 'center', gap: 10 }}>
          {deleted ? (
            <View style={{ height: 48, borderRadius: 16, backgroundColor: c.input, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon name="lock" size={18} color="textBody" />
              <Text variant="body" weight={700} color="textBody" style={{ fontSize: 14 }}>
                This user deleted their account
              </Text>
            </View>
          ) : blocked ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="lock" size={18} color="textBody" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight={700} style={{ fontSize: 15 }}>
                  Chat closed
                </Text>
                <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                  You blocked this user
                </Text>
              </View>
              <Button variant="tonal" label="Unblock" onPress={unblock} />
            </View>
          ) : pending ? (
            <View style={{ height: 48, borderRadius: 16, backgroundColor: c.input, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon name="lock" size={18} color="textBody" />
              <Text variant="body" weight={700} color="textBody" style={{ fontSize: 14 }}>
                You can write after {first} accepts
              </Text>
            </View>
          ) : declinedHere ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="cancel" size={18} color="textBody" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight={700} style={{ fontSize: 15 }}>
                  Declined for this vacancy
                </Text>
                <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                  {otherOpen.length ? `${otherOpen.map(ctxLabel).join(' and ')} stay${otherOpen.length === 1 ? 's' : ''} open` : `${first} got a polite notice`}
                </Text>
              </View>
              {otherOpen.length ? <Button variant="tonal" label={`Open ${ctxLabel(otherOpen[0]).split(' ')[0]}`} onPress={() => setCtx(otherOpen[0])} /> : null}
            </View>
          ) : (
            <>
              {!talked ? (
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  {SUGGESTIONS.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => submit(s)}
                      accessibilityRole="button"
                      style={{ height: 36, paddingHorizontal: 14, borderRadius: 999, backgroundColor: c.surface, borderWidth: 1, borderColor: c.divider, justifyContent: 'center' }}>
                      <Text variant="bodyS" weight={700} style={{ fontSize: 14 }}>
                        {s}
                      </Text>
                    </Pressable>
                  ))}
                  {activeVacancies.length ? (
                    <Pressable
                      onPress={() => setSheet('pickVacancy')}
                      accessibilityRole="button"
                      style={{ height: 36, paddingHorizontal: 14, borderRadius: 999, backgroundColor: c.primarySecondary, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Icon name="briefcase" size={16} color="link" />
                      <Text variant="bodyS" weight={700} color="link" style={{ fontSize: 14 }}>
                        Send a vacancy
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
              {reply ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeftWidth: 3, borderLeftColor: c.primary }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="caption" weight={700} color="link">
                      Reply to {reply.author}
                    </Text>
                    <Text variant="bodyS" color="textBody" numberOfLines={1}>
                      {reply.text}
                    </Text>
                  </View>
                  <Pressable onPress={() => setReply(null)} accessibilityRole="button" accessibilityLabel="Cancel reply" hitSlop={10}>
                    <Icon name="cancel" size={20} color="textLightSecondary" />
                  </Pressable>
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                <Pressable
                  onPress={() => setSheet('attach')}
                  accessibilityRole="button"
                  accessibilityLabel="Attach photo, vacancy, location or contact"
                  style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="add" size={22} color="primary" />
                </Pressable>
                <View style={{ flex: 1, minHeight: 48, borderRadius: 16, backgroundColor: c.input, paddingLeft: 16, paddingRight: 8, paddingVertical: 13, justifyContent: 'center' }}>
                  <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Message"
                    placeholderTextColor={c.textLightSecondary}
                    multiline
                    numberOfLines={1}
                    maxLength={2000}
                    onContentSizeChange={(e) => setInputH(Math.min(110, Math.max(22, Math.round(e.nativeEvent.contentSize.height))))}
                    accessibilityLabel="Message"
                    onKeyPress={(e) => {
                      const ne = e.nativeEvent as { key: string; shiftKey?: boolean };
                      if (Platform.OS === 'web' && ne.key === 'Enter' && !ne.shiftKey) {
                        e.preventDefault();
                        submit();
                      }
                    }}
                    style={{ fontFamily: fontFamily('sans', 400), fontSize: 16, lineHeight: 22, color: c.textHeadline, padding: 0, height: inputH, outlineStyle: 'none', resize: 'none' } as object}
                  />
                </View>
                <Pressable
                  onPress={() => submit()}
                  disabled={!text.trim()}
                  accessibilityRole="button"
                  accessibilityLabel="Send"
                  style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: text.trim() ? c.primary : c.control, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="arrow-right" size={22} color="ctaButtonText" />
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>

      {/* EmpChatAttach */}
      <BottomSheet visible={sheet === 'attach'} onClose={() => setSheet(null)} title="Attach" closable>
        <View>
          {(
            [
              ['camera', 'primarySecondary', 'link', 'Photo or video', 'From your gallery or the camera', 'photo'],
              ['briefcase', 'labelOrangeBack', 'labelOrangeText', 'Vacancy', 'Send one of your active vacancies', 'vacancy'],
              ['location', 'successBack', 'successText', 'Location', 'Venue address for an interview or trial day', 'location'],
              ['call', 'input', 'textHeadline', 'Contact', 'Share your phone number or email', 'contact'],
            ] as [IconName, 'primarySecondary' | 'labelOrangeBack' | 'successBack' | 'input', 'link' | 'labelOrangeText' | 'successText' | 'textHeadline', string, string, AttachKind][]
          ).map(([ic, bg, fg, title, sub, kind], i) => (
            <Pressable
              key={title}
              onPress={() => attach(kind)}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderColor: c.divider }}>
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: c[bg], alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={ic} size={22} color={fg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyL" weight={600} style={{ fontSize: 16 }}>
                  {title}
                </Text>
                <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                  {sub}
                </Text>
              </View>
              <Icon name="chevron-right" size={18} color="textLightSecondary" />
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => attachPhotos(true)} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: 4 }}>
          <Text variant="bodyS" weight={700} color="link" style={{ fontSize: 13 }}>
            Use sample photos
          </Text>
        </Pressable>
      </BottomSheet>

      {/* Vacancy picker */}
      <BottomSheet visible={sheet === 'pickVacancy'} onClose={() => setSheet(null)} title="Send a vacancy" subtitle="Only active vacancies can be sent" closable>
        <View>
          {activeVacancies.map((v, i) => (
            <Pressable
              key={v.id}
              onPress={() => (setSheet(null), push({ kind: 'vacancy', mine: true, vacancyId: v.id, time: clock() }, false))}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderColor: c.divider }}>
              <Image source={v.cover} contentFit="cover" style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: c.backDarker }} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15 }}>
                  {v.title}
                </Text>
                <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ fontSize: 13 }}>
                  {v.meta}
                </Text>
              </View>
              <Icon name="arrow-right" size={18} color="link" />
            </Pressable>
          ))}
        </View>
      </BottomSheet>

      {/* EmpChatMenu */}
      <BottomSheet visible={sheet === 'menu'} onClose={() => setSheet(null)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={t.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.backDarker }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="bodyL" weight={700} style={{ fontSize: 17 }}>
              {t.name}
            </Text>
            <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ fontSize: 13 }}>
              {cand ? cand.role.split(',')[0] : (t.subtitle ?? 'Candidate')}
              {ctx !== 'direct' ? ` · applied to ${vacOf(ctx)?.title}` : ' · Direct chat'}
            </Text>
          </View>
        </View>
        <View>
          {cand && !deleted ? (
            <MenuRow icon="user" title="View profile" sub="Photos, video and details" onPress={() => (setSheet(null), router.push({ pathname: '/talent/[id]', params: { id: cand.id } }))} />
          ) : null}
          {ctx !== 'direct' && t.candidateId && statusOf(ctx) !== 'declined' && !deleted ? (
            <MenuRow icon="cancel" title="Decline candidate" sub={`${first} gets a polite notice, the chat becomes inactive`} onPress={decline} />
          ) : null}
          <MenuRow
            icon="alert-circle"
            title="Report"
            sub="Tell us about spam, fraud or bad behaviour"
            onPress={() => (setSheet(null), router.push({ pathname: '/hire-chat/report', params: { id: t.id } }))}
          />
          {!blocked && !deleted ? (
            <MenuRow icon="lock" danger title="Block user" sub={`${cand?.gender === 'male' ? 'He' : 'She'} won’t be able to write to you or apply again`} onPress={() => setSheet('block')} />
          ) : null}
        </View>
      </BottomSheet>

      {/* EmpChatBlock */}
      <BottomSheet visible={sheet === 'block'} onClose={() => setSheet(null)}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: c.dangerBack, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="lock" size={26} color="dangerText" />
          </View>
          <Text variant="title" align="center">
            Block {t.name}?
          </Text>
          <Text variant="body" color="textBody" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
            Are you sure? The chat will be closed. {first} won’t be able to message you or apply to your vacancies.
          </Text>
        </View>
        <View>
          <Text variant="caption" weight={700} color="textBody" style={{ fontSize: 12, letterSpacing: 0.6 }}>
            REASON FOR BLOCKING *
          </Text>
          {BLOCK_REASONS.map((r, i) => (
            <Pressable
              key={r}
              onPress={() => setBlockReason(r)}
              accessibilityRole="radio"
              accessibilityState={{ checked: blockReason === r }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderTopWidth: i ? 1 : 0, borderColor: c.divider }}>
              <Text variant="bodyL" weight={600} style={{ flex: 1, fontSize: 16 }}>
                {r}
              </Text>
              <Radio on={blockReason === r} />
            </Pressable>
          ))}
        </View>
        <Button size="l" variant="destructive" label="Block" onPress={block} />
        <Button size="l" variant="neutral" label="Cancel" onPress={() => setSheet(null)} />
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

function MenuRow({ icon, title, sub, danger, onPress }: { icon: IconName; title: string; sub?: string; danger?: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: danger ? c.dangerBack : c.input, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={20} color={danger ? 'dangerText' : 'textHeadline'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyL" weight={600} color={danger ? 'dangerText' : 'textHeadline'} style={{ fontSize: 16 }}>
          {title}
        </Text>
        {sub ? (
          <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
            {sub}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
