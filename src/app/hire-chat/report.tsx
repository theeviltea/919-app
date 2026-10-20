import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Button, Field, Icon, Pressable, Text, useToast } from '@/components';
import { useEmployer } from '@/data/employer';
import { findCandidate } from '@/data/talentPool';
import { Radio } from '@/features/hire/ui';
import { useTheme } from '@/theme';

const REASONS = ['Asked for money or personal data', 'Fake profile or photos', 'Rude or inappropriate messages', 'Spam or advertising', 'No-show after agreeing to work', 'Something else'];

/** Report a candidate from the chat (EmpChatReport → EmpChatReportSent). */
export default function ReportCandidate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { threads, updateThread } = useEmployer();
  const t = threads.find((x) => x.id === id);
  const cand = t?.candidateId ? findCandidate(t.candidateId) : undefined;
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);
  const first = t?.name.split(' ')[0] ?? 'them';
  const back = () => (router.canGoBack() ? router.back() : router.navigate('/hire/messages'));

  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: c.back, paddingTop: insets.top + 128, paddingHorizontal: 40, alignItems: 'center' }}>
        <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: c.successBack, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={40} color="successText" />
        </View>
        <Text variant="title" align="center" style={{ marginTop: 20 }}>
          Report sent
        </Text>
        <Text variant="body" color="textBody" align="center" style={{ marginTop: 10, fontSize: 14, lineHeight: 21 }}>
          Thanks for keeping 919 safe. Our team will review it within 24 hours and email you the result.
        </Text>
        {t && t.state !== 'blocked' ? (
          <Pressable
            onPress={() => {
              updateThread(t.id, () => ({ state: 'blocked', box: 'inactive', reason: 'Blocked' }));
              toast({ text: `${t.name} is blocked`, kind: 'neutral', icon: 'lock' });
              back();
            }}
            accessibilityRole="button"
            style={{ alignSelf: 'stretch', marginTop: 20, height: 52, borderRadius: 16, backgroundColor: c.dangerBack, alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="body" weight={700} color="dangerText" style={{ fontSize: 15 }}>
              Also block {first}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={back}
          accessibilityRole="button"
          style={{ alignSelf: 'stretch', marginTop: 10, height: 52, borderRadius: 16, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" weight={600} style={{ fontSize: 15 }}>
            Back to chat
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 120, gap: 14, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BackButton onPress={back} />
          <Text variant="bodyL" weight={700} align="center" accessibilityRole="header" style={{ flex: 1, fontSize: 17, marginRight: 44 }}>
            Report
          </Text>
        </View>
        {t ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, backgroundColor: c.surface }}>
            <Image source={t.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.backDarker }} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyL" weight={700} style={{ fontSize: 16 }}>
                {t.name}
              </Text>
              <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                {cand ? `${cand.role.split(',')[0]} · ${cand.city}` : (t.subtitle ?? 'Candidate')}
              </Text>
            </View>
          </View>
        ) : null}
        <Text variant="caption" weight={700} color="textBody" style={{ fontSize: 12, letterSpacing: 0.6, paddingHorizontal: 4 }}>
          WHAT HAPPENED? *
        </Text>
        <View style={{ backgroundColor: c.surface, borderRadius: 20, paddingHorizontal: 18 }}>
          {REASONS.map((r, i) => (
            <Pressable
              key={r}
              onPress={() => setReason(r)}
              accessibilityRole="radio"
              accessibilityState={{ checked: reason === r }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderTopWidth: i ? 1 : 0, borderColor: c.divider }}>
              <Text variant="bodyL" weight={600} style={{ flex: 1, fontSize: 16 }}>
                {r}
              </Text>
              <Radio on={reason === r} />
            </Pressable>
          ))}
        </View>
        <Field label="Details" value={details} onChangeText={setDetails} multiline maxLength={500} counter placeholder="What exactly happened? Dates, messages, links" />
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
          <Icon name="lock" size={16} color="textBody" />
          <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>
            Your report goes to the 919 support team, not to {first}. We review every report within 24 hours.
          </Text>
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16) + 8, backgroundColor: c.back }}>
        <View style={{ width: '100%', maxWidth: 600, alignSelf: 'center' }}>
          <Button size="l" label="Send report" disabled={!reason} onPress={() => setSent(true)} />
        </View>
      </View>
    </View>
  );
}
