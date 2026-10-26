import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Button, EmptyState, Icon, type IconName, Pressable, SegmentedTabs, TAB_BAR_SPACE, Text, TierBadge, useToast } from '@/components';
import { initialsOf, useEmployer, type MyVacancy } from '@/data/employer';
import { applicantLine, asPublicVacancy, candidateOf, type Applicant, type ApplicantStatus } from '@/data/hiring';
import { Pill } from '@/features/hire/ui';
import { useVacancyActions } from '@/features/hire/VacancyActions';
import { ShareSheet } from '@/features/vacancies/ShareSheet';
import { useTheme } from '@/theme';

/** Employer — applicants of one vacancy (EmpApplicants / Accepted / Declined / Empty). Lives in the Vacancies tab. */
export default function Applicants() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: ApplicantStatus }>();
  const { vacancies } = useEmployer();
  const v = vacancies.find((x) => x.id === id);
  // Keyed by vacancy: tabs and sort start fresh for each one.
  return v ? <ApplicantsOf key={v.id} v={v} initialTab={tab} /> : <Missing />;
}

function Missing() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.back, paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
      <BackButton onPress={() => router.navigate('/hire/vacancies')} />
      <EmptyState icon="briefcase" title="Vacancy not found" text="It may have been deleted." passive />
    </View>
  );
}

function statusLine(v: MyVacancy) {
  if (v.status === 'active') return `Active · ${v.note.startsWith('7 of 7') ? 'published today' : v.note.split(' · ')[0]}`;
  if (v.status === 'archive') return `In archive · ${v.note}`;
  return v.note;
}

function ApplicantsOf({ v, initialTab }: { v: MyVacancy; initialTab?: ApplicantStatus }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { applicants, setApplicant, acceptApplicant, declineApplicant, threads } = useEmployer();
  const actions = useVacancyActions({ onDeleted: () => router.navigate('/hire/vacancies') });
  const [tab, setTab] = useState<ApplicantStatus>(initialTab ?? 'new');
  const [newestFirst, setNewestFirst] = useState(true);
  const all = applicants[v.id] ?? [];
  const count = (s: ApplicantStatus) => all.filter((x) => x.status === s).length;
  const list = all.filter((x) => x.status === tab).sort((a, b) => (newestFirst ? a.ago - b.ago : b.ago - a.ago));
  const live = v.status === 'active';

  const accept = (x: Applicant) => {
    const cand = candidateOf(x);
    // Accepting opens a chat in the vacancy's context (EmpChatNew).
    acceptApplicant(v.id, x.candidateId);
    toast({ text: `${cand.name} accepted · chat is open`, icon: 'check', aboveTabBar: true });
  };
  const decline = (x: Applicant) => {
    declineApplicant(v.id, x.candidateId);
    toast({ text: `${candidateOf(x).name} declined · they’ll get a polite notice`, kind: 'neutral', icon: 'cancel', aboveTabBar: true });
  };
  const backToNew = (x: Applicant) => {
    setApplicant(v.id, x.candidateId, 'new');
    toast({ text: `${candidateOf(x).name} is back in New`, kind: 'neutral', icon: 'arrow-left', aboveTabBar: true });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.back }}
      contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: TAB_BAR_SPACE + 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <BackButton onPress={() => (router.canGoBack() ? router.back() : router.navigate('/hire/vacancies'))} />
        <Pressable onPress={() => router.push({ pathname: '/my-vacancy/[id]', params: { id: v.id } })} accessibilityRole="link" style={{ flex: 1, minWidth: 0 }}>
          <Text variant="bodyL" weight={700} numberOfLines={1} accessibilityRole="header" style={{ fontSize: 17 }}>
            {v.title}
          </Text>
          <View style={{ marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: live ? c.successText : c.textLightSecondary }} />
            <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ fontSize: 13, flexShrink: 1 }}>
              {statusLine(v)}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => actions.open(v.id)}
          accessibilityRole="button"
          accessibilityLabel="Vacancy actions"
          style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="more" size={20} color="textHeadline" />
        </Pressable>
      </View>

      <SegmentedTabs<ApplicantStatus>
        items={[
          { key: 'new', label: 'New', count: count('new') },
          { key: 'accepted', label: 'Accepted', count: count('accepted') },
          { key: 'declined', label: 'Declined', count: count('declined') },
        ]}
        value={tab}
        onChange={setTab}
      />

      {all.length === 0 ? (
        <NoApplicants v={v} live={live} />
      ) : (
        <>
          {tab === 'new' && list.length ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
              <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                {list.length} new · {newestFirst ? 'newest' : 'oldest'} first
              </Text>
              <Pressable
                onPress={() => setNewestFirst(!newestFirst)}
                accessibilityRole="button"
                accessibilityLabel={`Sort: ${newestFirst ? 'newest' : 'oldest'} first`}
                hitSlop={8}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="sort" size={16} color="textHeadline" />
                <Text variant="bodyS" weight={600} style={{ fontSize: 13 }}>
                  {newestFirst ? 'Newest' : 'Oldest'}
                </Text>
              </Pressable>
            </View>
          ) : null}
          {tab === 'accepted' && list.length ? <Note icon="message" tone="blue" text="Accepted candidates got a notification and a chat with you. Agree on the details there." /> : null}
          {tab === 'declined' && list.length ? (
            <Note icon="notification" text="Declined candidates get a polite notice. Changed your mind? Move them back to New while the vacancy is active." />
          ) : null}

          {list.map((x) => (
            <ApplicantCard
              key={x.candidateId}
              x={x}
              live={live}
              onAccept={() => accept(x)}
              onDecline={() => decline(x)}
              onBack={() => backToNew(x)}
              onMessage={() => {
                const t = threads.find((th) => th.candidateId === x.candidateId);
                const id = t?.id ?? acceptApplicant(v.id, x.candidateId);
                router.push({ pathname: '/hire-chat/[id]', params: { id, ctx: v.id } });
              }}
            />
          ))}

          {list.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 48, paddingHorizontal: 24, gap: 8 }}>
              <Text variant="bodyL" weight={700} align="center">
                {tab === 'new' ? 'No new applicants' : tab === 'accepted' ? 'Nobody accepted yet' : 'Nobody declined'}
              </Text>
              <Text variant="body" color="textBody" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
                {tab === 'new'
                  ? 'You’ve gone through everyone. New applications will appear here.'
                  : tab === 'accepted'
                    ? 'Accept someone from New to open a chat with them.'
                    : 'Declined candidates will appear here.'}
              </Text>
            </View>
          ) : null}
        </>
      )}
      {actions.sheets}
    </ScrollView>
  );
}

function Note({ icon, text, tone }: { icon: IconName; text: string; tone?: 'blue' }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, backgroundColor: tone === 'blue' ? c.primarySecondary : c.surface }}>
      <Icon name={icon} size={18} color={tone === 'blue' ? 'link' : 'textBody'} />
      <Text variant="bodyS" color={tone === 'blue' ? 'link' : 'textBody'} style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>
        {text}
      </Text>
    </View>
  );
}

function ApplicantCard({ x, live, onAccept, onDecline, onBack, onMessage }: { x: Applicant; live: boolean; onAccept: () => void; onDecline: () => void; onBack: () => void; onMessage: () => void }) {
  const { c } = useTheme();
  const cand = candidateOf(x);
  const profile = () => router.push({ pathname: '/talent/[id]', params: { id: cand.id } });
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 14, gap: 12 }}>
      <Pressable onPress={profile} accessibilityRole="button" accessibilityLabel={`${cand.name}, ${applicantLine(cand)}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 52, height: 52 }}>
          <Image source={cand.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.backDarker }} />
          {cand.video && x.status === 'new' ? (
            <View
              accessibilityLabel="Has a video presentation"
              style={{
                position: 'absolute',
                right: -4,
                bottom: -4,
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: c.surface,
                backgroundColor: c.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon name="play-filled" size={10} color="#FFFFFF" />
            </View>
          ) : null}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text variant="bodyL" weight={600} numberOfLines={1} style={{ fontSize: 16, flexShrink: 1 }}>
              {cand.name}
            </Text>
            <TierBadge tier={cand.tier} size={18} />
          </View>
          <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 3, fontSize: 13 }}>
            {applicantLine(cand)}
          </Text>
        </View>
        {x.status === 'new' ? (
          <Text variant="caption" weight={400} color="textLightSecondary" style={{ fontSize: 12 }}>
            {x.when}
          </Text>
        ) : x.status === 'accepted' ? (
          <Pill label="Accepted" icon="check" bg={c.successBack} fg={c.successText} h={26} />
        ) : (
          <Pill label="Declined" bg={c.dangerBack} fg={c.dangerText} h={26} />
        )}
      </Pressable>

      {x.status === 'new' && x.note ? (
        <View style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: c.input }}>
          <Text variant="body" color="textPrimary" style={{ fontSize: 14, lineHeight: 20 }}>
            “{x.note}”
          </Text>
        </View>
      ) : null}
      {x.status === 'declined' && x.declinedNote ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="clock" size={16} color="textBody" />
          <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 13 }}>
            {x.declinedNote}
          </Text>
        </View>
      ) : null}

      {x.status === 'new' && live ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button variant="neutral" icon="cancel" label="Decline" onPress={onDecline} />
          </View>
          <View style={{ flex: 1 }}>
            <Button icon="check" label="Accept" onPress={onAccept} />
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button variant="neutral" icon="user" label="Profile" onPress={profile} />
          </View>
          {x.status === 'accepted' ? (
            <View style={{ flex: 1 }}>
              <Button icon="message" label="Message" onPress={onMessage} />
            </View>
          ) : x.status === 'declined' && live ? (
            <View style={{ flex: 1 }}>
              <Pressable
                onPress={onBack}
                accessibilityRole="button"
                style={{ height: 44, borderRadius: 14, backgroundColor: c.primarySecondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name="chevron-left" size={18} color="link" />
                <Text variant="body" weight={700} color="link" style={{ fontSize: 15 }}>
                  Back to New
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

/** EmpApplicantsEmpty */
function NoApplicants({ v, live }: { v: MyVacancy; live: boolean }) {
  const { c } = useTheme();
  const { info, verified } = useEmployer();
  const [share, setShare] = useState(false);
  return (
    <View style={{ alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 }}>
      <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="users" size={36} color="primary" />
      </View>
      <Text variant="title" align="center" style={{ marginTop: 20 }}>
        No applicants yet
      </Text>
      <Text variant="body" color="textBody" align="center" style={{ marginTop: 10, fontSize: 14, lineHeight: 21 }}>
        {live ? 'Your vacancy is live. New applicants will appear here — we will send you a notification.' : 'Applicants will appear here once the vacancy is live.'}
      </Text>
      {live ? (
        <View style={{ alignSelf: 'stretch', marginTop: 24 }}>
          <Button size="l" icon="share" label="Share vacancy" onPress={() => setShare(true)} />
        </View>
      ) : null}
      {v.detail ? <ShareSheet v={asPublicVacancy(v, v.detail, { name: info.name, initials: initialsOf(info.name), verified })} visible={share} onClose={() => setShare(false)} /> : null}
    </View>
  );
}
