import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, Icon, Pressable, TAB_BAR_SPACE, Text } from '@/components';
import { fallbackChat } from '@/data/empChat';
import { useEmployer, type EmpThread } from '@/data/employer';
import { findCandidate } from '@/data/talentPool';
import { Highlight, SearchField } from '@/features/hire/SearchField';
import { useTheme } from '@/theme';

type Filter = 'all' | 'chats' | 'messages' | 'vacancies';

/** Employer — Messages search (EmpMessagesSearch / EmpMessagesSearchEmpty): chats, messages and vacancies. Lives in the Messages tab. */
export default function ChatSearch() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { threads, vacancies, applicants } = useEmployer();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const needle = q.trim().toLowerCase();
  const has = (s?: string) => !!s && s.toLowerCase().includes(needle);
  const vacTitle = (k: string) => (k === 'direct' ? 'Direct' : (vacancies.find((v) => v.id === k)?.title ?? 'Vacancy'));
  const statusIn = (t: EmpThread, vid: string) => (t.candidateId ? applicants[vid]?.find((x) => x.candidateId === t.candidateId)?.status : undefined);

  // Chats: by name, role or a vacancy they talk about.
  const chats = needle
    ? threads.flatMap((t) => {
        const cand = t.candidateId ? findCandidate(t.candidateId) : undefined;
        const role = cand ? `${cand.role} · ${cand.city}` : (t.subtitle ?? '');
        const byVac = (t.vacancies ?? []).find(has);
        if (has(t.name)) return [{ t, sub: byVac ?? role }];
        if (byVac) {
          const vid = vacancies.find((v) => v.title === byVac)?.id;
          const st = vid ? statusIn(t, vid) : undefined;
          return [{ t, sub: `${byVac}${st === 'accepted' ? ' · Accepted' : st === 'declined' ? ' · Declined' : ''}` }];
        }
        if (has(role)) return [{ t, sub: role }];
        return [];
      })
    : [];

  // Messages: every text in every context.
  const messages = needle
    ? threads.flatMap((t) => {
        const chatsOf = t.chats ?? { [t.vacancies?.length ? 'vacancy' : 'direct']: fallbackChat(t.name, t.last, t.mine, t.time, !t.vacancies?.length) };
        return Object.entries(chatsOf).flatMap(([ctx, list]) =>
          list.filter((m) => m.kind === 'text' && has(m.text)).map((m) => ({ t, ctx, text: m.kind === 'text' ? (m.mine ? `You: ${m.text}` : m.text) : '', time: m.kind === 'text' ? m.time : '' })),
        );
      })
    : [];

  // Vacancies with chats about them.
  const vacs = needle
    ? vacancies
        .filter((v) => has(v.title))
        .map((v) => ({ v, n: threads.filter((t) => t.vacancies?.includes(v.title) || t.chats?.[v.id]).length }))
        .filter((x) => x.n)
    : [];

  const show = (f: Filter) => filter === 'all' || filter === f;
  const nothing = needle && !chats.length && !messages.length && !vacs.length;
  const open = (t: EmpThread, ctx?: string) => router.push({ pathname: '/hire-chat/[id]', params: { id: t.id, ...(ctx && ctx !== 'vacancy' ? { ctx } : {}) } });

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <SearchField value={q} onChange={setQ} placeholder="Name, vacancy or message" onCancel={() => (router.canGoBack() ? router.back() : router.navigate('/hire/messages'))} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {(
            [
              ['all', 'All'],
              ['chats', 'Chats'],
              ['messages', 'Messages'],
              ['vacancies', 'Vacancies'],
            ] as [Filter, string][]
          ).map(([k, l]) => (
            <Chip key={k} label={l} selected={filter === k} onPress={() => setFilter(k)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: TAB_BAR_SPACE + 16, gap: 10, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        {!needle ? (
          <Text variant="bodyS" color="textBody" align="center" style={{ paddingTop: 40, paddingHorizontal: 24, fontSize: 14, lineHeight: 21 }}>
            Search by a candidate’s name, a vacancy title or a word from the conversation.
          </Text>
        ) : null}

        {nothing ? (
          <View style={{ alignItems: 'center', paddingTop: 56, paddingHorizontal: 24 }}>
            <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="search" size={36} color="primary" />
            </View>
            <Text variant="title" align="center" style={{ marginTop: 20 }}>
              Nothing found
            </Text>
            <Text variant="body" color="textBody" align="center" style={{ marginTop: 10, fontSize: 14, lineHeight: 21 }}>
              No chats or messages match “{q.trim()}”. Try a name, vacancy title or a word from the conversation.
            </Text>
          </View>
        ) : null}

        {show('chats') && chats.length ? (
          <>
            <SectionTitle title="Chats" n={chats.length} />
            <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 16 }}>
              {chats.map(({ t, sub }, i) => (
                <Pressable
                  key={t.id}
                  onPress={() => open(t)}
                  accessibilityRole="button"
                  accessibilityLabel={t.name}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderColor: c.divider }}>
                  <Image source={t.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.backDarker }} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Highlight text={t.name} q={q} weight={700} color="textHeadline" style={{ fontSize: 16 }} numberOfLines={1} />
                    <Highlight text={sub} q={q} color="textBody" style={{ fontSize: 13, marginTop: 2 }} numberOfLines={1} />
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {show('messages') && messages.length ? (
          <>
            <SectionTitle title="Messages" n={messages.length} />
            <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 16 }}>
              {messages.map((m, i) => (
                <Pressable
                  key={`${m.t.id}-${m.ctx}-${i}`}
                  onPress={() => open(m.t, m.ctx)}
                  accessibilityRole="button"
                  accessibilityLabel={`${m.t.name}: ${m.text}`}
                  style={{ flexDirection: 'row', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderColor: c.divider }}>
                  <Image source={m.t.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.backDarker }} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text variant="body" weight={700} numberOfLines={1} style={{ flex: 1, fontSize: 16 }}>
                        {m.t.name}
                      </Text>
                      <Text variant="caption" weight={400} color="textLightSecondary" style={{ fontSize: 12 }}>
                        {m.time}
                      </Text>
                    </View>
                    <Text variant="caption" weight={700} color="textBody" numberOfLines={1} style={{ fontSize: 12, marginTop: 1 }}>
                      {m.ctx === 'vacancy' ? (m.t.vacancies?.[0] ?? 'Vacancy') : vacTitle(m.ctx)}
                    </Text>
                    <Highlight text={m.text} q={q} color="textHeadline" style={{ fontSize: 14, lineHeight: 20, marginTop: 2 }} numberOfLines={2} />
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {show('vacancies') && vacs.length ? (
          <>
            <SectionTitle title="Vacancies" n={vacs.length} />
            <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 16 }}>
              {vacs.map(({ v, n }, i) => (
                <Pressable
                  key={v.id}
                  onPress={() => (setQ(v.title), setFilter('chats'))}
                  accessibilityRole="button"
                  accessibilityLabel={`${v.title}, ${n} chats`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderColor: c.divider }}>
                  <Image source={v.cover} contentFit="cover" style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: c.backDarker }} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Highlight text={v.title} q={q} weight={700} color="textHeadline" style={{ fontSize: 16 }} numberOfLines={1} />
                    <Text variant="bodyS" color="textBody" style={{ fontSize: 13, marginTop: 2 }}>
                      {n} chat{n === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={18} color="textLightSecondary" />
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {needle && !nothing && ((filter === 'chats' && !chats.length) || (filter === 'messages' && !messages.length) || (filter === 'vacancies' && !vacs.length)) ? (
          <Text variant="bodyS" color="textBody" align="center" style={{ paddingTop: 24 }}>
            Nothing in {filter}. Try All.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SectionTitle({ title, n }: { title: string; n: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, paddingHorizontal: 4, marginTop: 4 }}>
      <Text variant="body" weight={700} style={{ fontSize: 15 }}>
        {title}
      </Text>
      <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
        {n}
      </Text>
    </View>
  );
}
