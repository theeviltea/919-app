import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, BottomSheet, Button, ChatBubble, ChatDate, ChatSystemLine, EmptyState, Icon, IconButton, Pressable, Text, useToast } from '@/components';
import { contractTypes, formatAmount } from '@/data/dictionaries';
import { findVacancy } from '@/data/mock';
import { clockNow, useSeeker, type Msg, type NewMsg } from '@/data/seeker';
import { SAMPLE_PHOTOS, VIDEO_POSTER } from '@/features/auth/media';
import { pickImages } from '@/features/auth/pickImage';
import { ChatBackground } from '@/features/chat/ChatBackground';
import { SwipeReply } from '@/features/chat/SwipeReply';
import { openPhotos, openVideo } from '@/features/media/viewer';
import { ChatSkeleton } from '@/features/skeletons/ChatSkeleton';
import { useFirstLoad } from '@/features/skeletons/useFirstLoad';
import { fontFamily, useTheme } from '@/theme';

type Quote = { author: string; text: string };
type Sheet = 'attach' | 'menu' | 'block' | 'actions' | null;

const replies = ['Great, thank you!', 'Got it 👍', 'Perfect, I’ll get back to you shortly.', 'Thanks! Let me check with the manager.'];

function quoteText(m: Msg): string {
  if (m.kind === 'text') return m.text;
  if (m.kind === 'photos') return m.text || 'Photo';
  if (m.kind === 'video') return m.text || 'Video';
  if (m.kind === 'contact') return `Contact · ${m.name}`;
  return '';
}

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

function VideoTile({ poster, duration, onOpen }: { poster: ImageSourcePropType; duration: string; onOpen: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel="Play video" style={{ borderRadius: 16, overflow: 'hidden' }}>
      <Image source={poster} contentFit="cover" style={{ width: 242, height: 300, backgroundColor: c.backDarker }} />
      <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.mediaOverlay, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="play" size={24} color="#FFFFFF" />
        </View>
      </View>
      <View
        style={{ position: 'absolute', left: 10, bottom: 10, paddingHorizontal: 8, height: 24, borderRadius: 12, backgroundColor: c.mediaOverlay, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Icon name="video" size={14} color="#FFFFFF" />
        <Text variant="caption" weight={600} color="#FFFFFF">
          {duration}
        </Text>
      </View>
    </Pressable>
  );
}

function ContactCard({ m }: { m: Extract<Msg, { kind: 'contact' }> }) {
  const { c } = useTheme();
  const fg = m.mine ? 'ctaButtonText' : 'textHeadline';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 16, backgroundColor: m.mine ? c.bubbleQuote : c.surfaceInset }}>
      {m.photo ? (
        <Image source={m.photo} contentFit="cover" style={{ width: 44, height: 44, borderRadius: 22 }} />
      ) : (
        <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="user" size={22} color="primary" />
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="body" weight={700} color={fg} numberOfLines={1}>
          {m.name}
        </Text>
        {m.phone ? (
          <Text variant="bodyS" color={fg} style={{ opacity: 0.85 }}>
            {m.phone}
          </Text>
        ) : null}
        {m.email ? (
          <Text variant="bodyS" color={fg} style={{ opacity: 0.85 }} numberOfLines={1}>
            {m.email}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/** Chat with an employer: vacancy context, media, replies, contact requests, withdraw / block. */
export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { thread, updateThread, send, profile, withdraw, appFor, acceptRequest, declineRequest } = useSeeker();
  const t = thread(id);
  const v = t?.vacancyId ? findVacancy(t.vacancyId) : undefined;
  const [text, setText] = useState('');
  const [reply, setReply] = useState<Quote | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [picked, setPicked] = useState<Msg | null>(null);
  const [typing, setTyping] = useState(false);
  const [inputH, setInputH] = useState(22);
  const scroll = useRef<ScrollView>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loading = useFirstLoad(`chat:${id}`);

  const unread = t?.unread ?? 0;
  useEffect(() => {
    if (unread && t?.state !== 'request') updateThread(id, () => ({ unread: 0 }));
  }, [id, unread, t?.state, updateThread]);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  if (!t) {
    return (
      <View style={{ flex: 1, backgroundColor: c.back, paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
        <BackButton />
        <EmptyState icon="message" title="Chat not found" text="It may have been removed." passive />
      </View>
    );
  }

  const me = `${profile.firstName} ${profile.lastName}`.trim() || 'You';
  const canWrite = t.state === 'active';
  const firstName = t.person.name.split(' ')[0];

  const autoReply = () => {
    if (!t.person.online) return;
    setTyping(true);
    timer.current = setTimeout(() => {
      setTyping(false);
      send(t.id, { kind: 'text', mine: false, text: replies[Math.floor(Math.random() * replies.length)], time: clockNow() });
    }, 1800);
  };

  const push = (msg: NewMsg, answer = true) => {
    send(t.id, msg);
    setReply(null);
    if (answer) autoReply();
  };

  const submit = () => {
    const body = text.trim();
    if (!body) return;
    push({ kind: 'text', mine: true, text: body, time: clockNow(), quote: reply ?? undefined });
    setText('');
    setInputH(22);
  };

  const attachPhoto = async (sample: boolean) => {
    setSheet(null);
    const photos = sample ? [SAMPLE_PHOTOS[1], SAMPLE_PHOTOS[2]] : await pickImages({ multiple: true, limit: 4 });
    if (photos.length) push({ kind: 'photos', mine: true, photos, time: clockNow() });
  };

  const accept = () => acceptRequest(t.id);

  const decline = () => {
    declineRequest(t.id);
    toast({ text: 'Request declined. The employer won’t be notified', kind: 'neutral', icon: 'cancel' });
    router.back();
  };

  const doWithdraw = () => {
    setSheet(null);
    if (t.vacancyId) withdraw(t.vacancyId);
    updateThread(t.id, (x) => ({
      state: 'withdrawn',
      archived: true,
      messages: [...x.messages, { id: `w${x.messages.length}`, kind: 'system', tone: 'danger', text: 'You withdrew your application', time: clockNow() }],
    }));
  };

  const block = () => {
    setSheet(null);
    updateThread(t.id, (x) => ({
      state: 'blocked',
      messages: [...x.messages, { id: `b${x.messages.length}`, kind: 'system', tone: 'danger', text: `You blocked ${x.company.name}`, time: clockNow() }],
    }));
  };

  const unblock = () => updateThread(t.id, () => ({ state: 'active' }));

  const app = t.vacancyId ? appFor(t.vacancyId) : undefined;
  const canWithdraw = !!app && (app.status === 'pending' || app.status === 'accepted') && t.state === 'active';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.back }}>
      {/* header */}
      <View style={{ paddingTop: insets.top + 8, paddingBottom: 10, paddingHorizontal: 12, backgroundColor: c.surfacePanel, borderBottomWidth: 1, borderColor: c.divider, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <BackButton />
          {t.person.photo ? (
            <Image source={t.person.photo} contentFit="cover" style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.backDarker }} />
          ) : (
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="body" weight={700} color="ctaButtonText">
                {t.company.initials}
              </Text>
            </View>
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text variant="body" weight={700} numberOfLines={1} style={{ flexShrink: 1 }} accessibilityRole="header">
                {t.person.name}
              </Text>
              {t.company.verified ? <Icon name="verified" size={16} color="primary" /> : null}
            </View>
            <Text variant="caption" weight={400} color={typing ? 'link' : 'textBody'} numberOfLines={1}>
              {typing ? 'typing…' : `${t.person.online ? 'online' : t.person.role} · ${t.company.name}`}
            </Text>
          </View>
          <IconButton icon="more" label="Chat menu" onPress={() => setSheet('menu')} />
        </View>
        {v ? (
          <Pressable
            onPress={() => router.push({ pathname: '/vacancy/[id]', params: { id: v.id } })}
            accessibilityRole="link"
            accessibilityLabel={`Vacancy: ${v.title}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 16, backgroundColor: c.surface }}>
            <Image source={v.cover} contentFit="cover" style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.backDarker }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="bodyS" weight={700} numberOfLines={1}>
                {v.title}
              </Text>
              <Text variant="caption" weight={400} color="textBody" numberOfLines={1}>
                {v.pay.currency} {formatAmount(v.pay.amount)} {contractTypes[v.pay.contract].suffix} · {v.city}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color="textLightSecondary" />
          </Pressable>
        ) : null}
      </View>

      {/* messages, over the 919 pattern */}
      <View style={{ flex: 1 }}>
        <ChatBackground />
        {loading ? (
          <ChatSkeleton variant="seeker" />
        ) : (
        <ScrollView
          ref={scroll}
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1, justifyContent: 'flex-end', width: '100%', maxWidth: 720, alignSelf: 'center' }}
          keyboardShouldPersistTaps="handled">
          {t.state === 'request' ? (
            <View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
              <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="title" color="ctaButtonText">
                  {t.company.initials}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text variant="bodyL" weight={700}>
                  {t.company.name}
                </Text>
                {t.company.verified ? <Icon name="verified" size={18} color="primary" /> : null}
              </View>
              <Text variant="bodyS" color="textBody" align="center">
                {t.person.name}, {t.person.role} · wants to contact you directly
              </Text>
            </View>
          ) : null}
          {t.messages.map((m) => {
            if (m.kind === 'date') return <ChatDate key={m.id} label={m.label} />;
            if (m.kind === 'system') return <ChatSystemLine key={m.id} text={m.text} time={m.time} tone={m.tone} />;
            const attachment =
              m.kind === 'photos' ? (
                <PhotoGrid photos={m.photos} />
              ) : m.kind === 'video' ? (
                <VideoTile
                  poster={m.poster}
                  duration={m.duration}
                  onOpen={() =>
                    openVideo({
                      poster: m.poster,
                      duration: m.duration,
                      label: `Chat · ${t.company.name}`,
                      name: m.mine ? me : t.person.name,
                      avatar: m.mine ? profile.photo : t.person.photo,
                      subtitle: m.mine ? `Sent to ${t.company.name} · ${m.time}` : `${t.person.role} · ${m.time}`,
                      text: m.text,
                    })
                  }
                />
              ) : m.kind === 'contact' ? (
                <ContactCard m={m} />
              ) : undefined;
            const body = m.kind === 'text' || m.kind === 'photos' || m.kind === 'video' ? m.text : undefined;
            return (
              <SwipeReply
                key={m.id}
                mine={m.mine}
                canReply={canWrite}
                onReply={() => setReply({ author: m.mine ? 'You' : firstName, text: quoteText(m) })}
                onLongPress={() => (setPicked(m), setSheet('actions'))}>
                <ChatBubble
                  mine={m.mine}
                  text={body}
                  time={m.time}
                  quote={m.kind === 'text' ? m.quote : undefined}
                  attachment={m.kind === 'contact' ? <View style={{ padding: 2 }}>{attachment}</View> : attachment}
                />
              </SwipeReply>
            );
          })}
          {t.state === 'request' ? <ChatBubble text={t.requestText} time={t.time} /> : null}
          {typing ? (
            <View style={{ alignSelf: 'flex-start', paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.textLightSecondary, opacity: 0.5 + i * 0.25 }} />
              ))}
            </View>
          ) : null}
        </ScrollView>
        )}
      </View>

      {/* bottom */}
      <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: insets.bottom + 10, backgroundColor: c.surfacePanel, borderTopWidth: 1, borderColor: c.divider }}>
        <View style={{ width: '100%', maxWidth: 720, alignSelf: 'center', gap: 10 }}>
          {t.state === 'request' ? (
            <>
              <Text variant="bodyS" color="textBody" align="center">
                Accept the request to reply. {t.company.name} will see your profile and can message you.
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button variant="neutral" label="Decline" onPress={decline} style={{ flex: 1 }} />
                <Button label="Accept" onPress={accept} style={{ flex: 1 }} />
              </View>
            </>
          ) : t.state === 'blocked' ? (
            <>
              <Text variant="bodyS" color="textBody" align="center">
                You blocked {t.company.name}. They can’t message you or invite you to vacancies.
              </Text>
              <Button variant="secondary" label="Unblock" onPress={unblock} />
            </>
          ) : t.state === 'withdrawn' ? (
            <Text variant="bodyS" color="textBody" align="center" style={{ paddingVertical: 8 }}>
              You withdrew your application. The chat is in the archive.
            </Text>
          ) : (
            <>
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
                  disabled={!canWrite}
                  accessibilityRole="button"
                  accessibilityLabel="Attach"
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
                  onPress={submit}
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

      {/* attach */}
      <BottomSheet visible={sheet === 'attach'} onClose={() => setSheet(null)} title="Attach">
        <Button variant="neutral" icon="image" label="Photo from library" onPress={() => attachPhoto(false)} />
        <Button variant="neutral" icon="sparkles" label="Use sample photos" onPress={() => attachPhoto(true)} />
        <Button
          variant="neutral"
          icon="video"
          label="Video presentation"
          onPress={() => (setSheet(null), push({ kind: 'video', mine: true, poster: profile.video?.poster ?? VIDEO_POSTER, duration: profile.video?.duration ?? '0:42', time: clockNow() }))}
        />
        <Button
          variant="neutral"
          icon="user"
          label="My contact"
          onPress={() => (setSheet(null), push({ kind: 'contact', mine: true, name: me, phone: '+971 50 123 4567', email: 'mia@919.ae', photo: profile.photo, time: clockNow() }))}
        />
      </BottomSheet>

      {/* message actions */}
      <BottomSheet visible={sheet === 'actions'} onClose={() => setSheet(null)}>
        {picked && canWrite ? (
          <Button
            variant="neutral"
            icon="arrow-left"
            label="Reply"
            onPress={() => (setSheet(null), setReply({ author: 'mine' in picked && picked.mine ? 'You' : firstName, text: quoteText(picked) }))}
          />
        ) : null}
        {picked && quoteText(picked) ? (
          <Button
            variant="neutral"
            icon="grid"
            label="Copy text"
            onPress={() => {
              setSheet(null);
              Clipboard.setStringAsync(quoteText(picked)).then(() => toast({ text: 'Copied', kind: 'neutral', icon: 'check' }));
            }}
          />
        ) : null}
        {picked && 'mine' in picked && !picked.mine ? (
          <Button
            variant="danger"
            icon="alert-circle"
            label="Report message"
            onPress={() => (setSheet(null), toast({ text: 'Thanks. The 919 team will review this message', kind: 'neutral', icon: 'alert-circle' }))}
          />
        ) : null}
      </BottomSheet>

      {/* menu */}
      <BottomSheet visible={sheet === 'menu'} onClose={() => setSheet(null)} title={t.company.name} subtitle={`${t.person.name}, ${t.person.role}`}>
        {v ? <Button variant="neutral" icon="briefcase" label="View vacancy" onPress={() => (setSheet(null), router.push({ pathname: '/vacancy/[id]', params: { id: v.id } }))} /> : null}
        {canWithdraw ? <Button variant="neutral" icon="logout" label="Withdraw application" onPress={doWithdraw} /> : null}
        <Button
          variant="neutral"
          icon="alert-circle"
          label="Report"
          onPress={() => (setSheet(null), toast({ text: 'Thanks. The 919 team will check this employer', kind: 'neutral', icon: 'alert-circle' }))}
        />
        {t.state !== 'blocked' ? <Button variant="danger" icon="cancel" label={`Block ${t.company.name}`} onPress={() => setSheet('block')} /> : null}
      </BottomSheet>

      <BottomSheet
        visible={sheet === 'block'}
        onClose={() => setSheet(null)}
        title={`Block ${t.company.name}?`}
        subtitle="They won’t be able to message you or invite you to vacancies. You can unblock them later.">
        <Button variant="danger" label="Block" onPress={block} />
        <Button variant="neutral" label="Cancel" onPress={() => setSheet(null)} />
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}
