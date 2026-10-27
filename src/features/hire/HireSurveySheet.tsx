import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Text, type IconName } from '@/components';
import { hireProgress, useEmployer, type HireAnswer } from '@/data/employer';
import { findCandidate } from '@/data/talentPool';
import { useTheme, type Colors } from '@/theme';

import { Pill } from './ui';

const OPTIONS: { key: HireAnswer; label: string; icon: IconName; bg: keyof Colors; fg: keyof Colors }[] = [
  { key: 'nofit', label: 'Not a fit', icon: 'cancel', bg: 'dangerBack', fg: 'dangerText' },
  { key: 'hired', label: 'Hired', icon: 'check', bg: 'successBack', fg: 'successText' },
  { key: 'deciding', label: 'Still deciding', icon: 'clock', bg: 'attentionBack', fg: 'attentionText' },
];

/** Three shortcut answers for one candidate: Not a fit / Hired / Still deciding. */
function AnswerButtons({ value, onChange, name }: { value?: HireAnswer; onChange: (a: HireAnswer) => void; name: string }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={`How did it go with ${name}`} style={{ flexDirection: 'row', gap: 6 }}>
      {OPTIONS.map((o) => {
        const on = value === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={{
              flex: 1,
              height: 38,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: on ? c[o.fg] : 'transparent',
              backgroundColor: on ? c[o.bg] : c.input,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              paddingHorizontal: 4,
            }}>
            {on ? <Icon name={o.icon} size={15} color={o.fg} /> : null}
            <Text variant="bodyS" weight={on ? 700 : 600} color={on ? o.fg : 'textHeadline'} numberOfLines={1} style={{ fontSize: 13 }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * EmpHireSurvey / EmpHireSurveyDone — "How did it go with your candidates?" for one vacancy.
 * Opened by the push (notification), automatically once per session on Vacancies, or from the vacancy card.
 */
export function HireSurveySheet() {
  const { hireSurveyFor: vid, vacancies } = useEmployer();
  const v = vacancies.find((x) => x.id === vid);
  // Keyed by vacancy: the draft starts from the saved answers every time the sheet opens.
  return v ? <Survey key={v.id} vacancyId={v.id} /> : null;
}

function Survey({ vacancyId }: { vacancyId: string }) {
  const { c } = useTheme();
  const { height } = useWindowDimensions();
  const { closeHireSurvey, hireAnswers, saveHireAnswers, applicants, vacancies, threads, updateVacancy } = useEmployer();
  const v = vacancies.find((x) => x.id === vacancyId)!;
  const accepted = (applicants[vacancyId] ?? []).filter((a) => a.status === 'accepted');
  const [draft, setDraft] = useState<Record<string, HireAnswer>>(() => hireAnswers[vacancyId] ?? {});
  const [done, setDone] = useState(false);

  const answered = accepted.filter((a) => draft[a.candidateId]).length;
  const p = hireProgress(accepted, draft);
  const later = accepted.filter((a) => !draft[a.candidateId] || draft[a.candidateId] === 'deciding').map((a) => findCandidate(a.candidateId)?.name ?? 'the candidate');
  const names = later.length > 2 ? `${later.slice(0, 2).join(', ')} and ${later.length - 2} more` : later.join(' and ');
  const openChat = (candidateId: string) => {
    const th = threads.find((t) => t.candidateId === candidateId);
    if (!th) return;
    closeHireSurvey();
    router.push({ pathname: '/hire-chat/[id]', params: { id: th.id } });
  };
  const closeVacancy = () => {
    updateVacancy(v.id, { status: 'archive', note: `Closed today · ${p.hired} hired`, daysLeft: undefined, urgentLeft: undefined });
    closeHireSurvey();
  };

  if (done)
    return (
      <BottomSheet visible onClose={closeHireSurvey} closable>
        <View style={{ alignItems: 'center', paddingTop: 8 }}>
          <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: c.successBack, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check-double" size={34} color="successText" />
          </View>
          <Text variant="title" align="center" style={{ marginTop: 16 }}>
            Thanks, saved
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 12 }}>
            {p.hired ? <Pill label={`${p.hired} hired`} icon="check" bg={c.successBack} fg={c.successText} h={26} /> : null}
            {p.deciding ? <Pill label={`${p.deciding} still deciding`} icon="clock" bg={c.attentionBack} fg={c.attentionText} h={26} /> : null}
            {p.nofit ? <Pill label={`${p.nofit} not a fit`} icon="cancel" bg={c.dangerBack} fg={c.dangerText} h={26} /> : null}
          </View>
          {later.length ? (
            <Text variant="body" color="textBody" align="center" style={{ marginTop: 12, fontSize: 14, lineHeight: 21 }}>
              We’ll ask about {names} again in 3 days.
            </Text>
          ) : null}
        </View>
        {p.hired && v.status === 'active' ? (
          <>
            <View style={{ flexDirection: 'row', gap: 12, borderRadius: 18, backgroundColor: c.surfaceInset, paddingVertical: 14, paddingHorizontal: 16 }}>
              <Icon name="briefcase" size={22} color="primary" />
              <View style={{ flex: 1 }}>
                <Text variant="body" weight={700} style={{ fontSize: 15 }}>
                  Close the vacancy?
                </Text>
                <Text variant="bodyS" color="textPrimary" style={{ marginTop: 3, fontSize: 13, lineHeight: 19 }}>
                  You hired someone for {v.title}. Close it to stop new applicants, or keep it open if you need more people.
                </Text>
              </View>
            </View>
            <View style={{ gap: 10 }}>
              <Button size="l" label="Close vacancy" onPress={closeVacancy} />
              <Button size="l" variant="secondary" label="Keep it open" onPress={closeHireSurvey} />
            </View>
          </>
        ) : (
          <Button size="l" label="Done" onPress={closeHireSurvey} />
        )}
      </BottomSheet>
    );

  return (
    <BottomSheet
      visible
      onClose={closeHireSurvey}
      closable
      title="How did it go with your candidates?"
      subtitle={`${v.title} · ${accepted.length} accepted. Mark who you hired — it takes a few taps.`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1, height: 6, borderRadius: 999, backgroundColor: c.input }}>
          <View style={{ width: `${accepted.length ? (answered / accepted.length) * 100 : 0}%`, height: 6, borderRadius: 999, backgroundColor: c.primary }} />
        </View>
        <Text variant="bodyS" weight={600} color="textBody" style={{ fontSize: 13 }}>
          {answered} of {accepted.length}
        </Text>
      </View>
      <ScrollView style={{ maxHeight: height * 0.46, flexGrow: 0 }} showsVerticalScrollIndicator={false}>
        {accepted.map((a, i) => {
          const cand = findCandidate(a.candidateId);
          if (!cand) return null;
          const hasChat = threads.some((t) => t.candidateId === a.candidateId);
          return (
            <View key={a.candidateId} style={{ gap: 10, paddingVertical: 12, borderBottomWidth: i < accepted.length - 1 ? 1 : 0, borderColor: c.divider }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Image source={cand.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.backDarker }} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15 }}>
                    {cand.name}
                  </Text>
                  <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 2, fontSize: 13 }}>
                    Accepted {a.when.toLowerCase() === 'yesterday' ? 'yesterday' : a.when} · {cand.role}
                  </Text>
                </View>
                {hasChat ? (
                  <Pressable
                    onPress={() => openChat(a.candidateId)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open chat with ${cand.name}`}
                    style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="message" size={18} />
                  </Pressable>
                ) : null}
              </View>
              <AnswerButtons name={cand.name} value={draft[a.candidateId]} onChange={(ans) => setDraft((d) => ({ ...d, [a.candidateId]: ans }))} />
            </View>
          );
        })}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name="lock" size={16} color="textBody" />
        <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
          Candidates don’t see your answers
        </Text>
      </View>
      <View style={{ gap: 2 }}>
        <Button
          size="l"
          label="Save answers"
          disabled={!answered}
          onPress={() => {
            saveHireAnswers(v.id, draft);
            setDone(true);
          }}
        />
        <Pressable onPress={closeHireSurvey} accessibilityRole="button" style={{ height: 52, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" weight={700} style={{ fontSize: 15 }}>
            Ask me later
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

/** Card row on the vacancy (EmpHiringResults): "Who did you hire?" while answers are missing, the summary after. */
export function HireAskRow({ vacancyId }: { vacancyId: string }) {
  const { c } = useTheme();
  const { applicants, hireAnswers, openHireSurvey } = useEmployer();
  const p = hireProgress(applicants[vacancyId], hireAnswers[vacancyId]);
  if (!p.accepted.length) return null;
  if (p.unanswered)
    return (
      <Pressable
        onPress={() => openHireSurvey(vacancyId)}
        accessibilityRole="button"
        accessibilityLabel={`Who did you hire? ${p.accepted.length} accepted`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, backgroundColor: c.primarySecondary }}>
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check-double" size={20} color="primary" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="body" weight={700} style={{ fontSize: 15 }}>
            Who did you hire?
          </Text>
          <Text variant="bodyS" color="textPrimary" numberOfLines={1} style={{ marginTop: 2, fontSize: 13 }}>
            {p.accepted.length} accepted · tell us how it went
          </Text>
        </View>
        <View style={{ height: 32, paddingHorizontal: 12, borderRadius: 10, backgroundColor: c.primary, justifyContent: 'center' }}>
          <Text variant="bodyS" weight={700} color="ctaButtonText" style={{ fontSize: 13 }}>
            Answer
          </Text>
        </View>
      </Pressable>
    );
  return (
    <Pressable onPress={() => openHireSurvey(vacancyId)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {p.hired ? <Pill label={`${p.hired} hired`} icon="check" bg={c.successBack} fg={c.successText} h={26} /> : null}
      <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ flex: 1, fontSize: 13 }}>
        {[p.deciding ? `${p.deciding} still deciding` : '', !p.hired && p.nofit ? `${p.nofit} not a fit` : ''].filter(Boolean).join(' · ')}
      </Text>
      <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
        Edit answers
      </Text>
    </Pressable>
  );
}
