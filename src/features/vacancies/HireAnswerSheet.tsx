import { Image } from 'expo-image';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { BottomSheet, Button, Pressable, Text } from '@/components';
import { HIRE_OTHER_MAX, type HireAnswer } from '@/data/seeker';
import type { Vacancy } from '@/data/types';
import { fontFamily, useTheme } from '@/theme';

type Choice = 'yes' | 'no' | 'process' | 'other';
const OPTIONS: { key: Choice; label: string; sub?: string }[] = [
  { key: 'yes', label: 'Yes, I got the job', sub: 'We’ll move it to Active' },
  { key: 'no', label: 'No, it didn’t work out' },
  { key: 'process', label: 'Still in process' },
  { key: 'other', label: 'Other answer' },
];

const toChoice = (a?: HireAnswer): Choice | undefined => (a === undefined ? undefined : typeof a === 'object' ? 'other' : a);

/** SeekHireSurvey / SeekHireSurveyOther — "Did you get this job?" for an accepted application. Mount with a `key` per application so the answer starts fresh. */
export function HireAnswerSheet({
  v,
  acceptedOn,
  initial,
  visible,
  onClose,
  onLater,
  onSend,
}: {
  v?: Vacancy;
  acceptedOn?: string;
  initial?: HireAnswer;
  visible: boolean;
  onClose: () => void;
  onLater: () => void;
  onSend: (a: HireAnswer) => void;
}) {
  const { c } = useTheme();
  const [choice, setChoice] = useState<Choice | undefined>(toChoice(initial));
  const [other, setOther] = useState(typeof initial === 'object' ? initial.other : '');
  const [focused, setFocused] = useState(false);
  if (!v) return null;
  const ready = choice !== undefined && (choice !== 'other' || other.trim().length > 0);
  const send = () => {
    if (!choice) return;
    onSend(choice === 'other' ? { other: other.trim() } : choice);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      closable
      title="Did you get this job?"
      subtitle={`${v.company.name} accepted your application. Tell us how it went — it helps us show you better jobs.`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 16, backgroundColor: c.surfaceInset }}>
        <Image source={v.cover} contentFit="cover" style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: c.backDarker }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15 }}>
            {v.title}
          </Text>
          <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 2 }}>
            {v.company.name}
            {acceptedOn ? ` · accepted ${acceptedOn}` : ''}
          </Text>
        </View>
      </View>

      <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
        {OPTIONS.map((o) => {
          const on = choice === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => setChoice(o.key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={{
                minHeight: 56,
                borderRadius: 16,
                borderWidth: on ? 2 : 1,
                borderColor: on ? c.primary : c.stroke,
                backgroundColor: on ? c.primarySecondary : c.surface,
                paddingVertical: 10,
                paddingHorizontal: on ? 13 : 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: on ? 7 : 2, borderColor: on ? c.primary : c.control }} />
              <View style={{ flex: 1 }}>
                <Text variant="body" weight={on ? 700 : 600} style={{ fontSize: 15 }}>
                  {o.label}
                </Text>
                {o.sub ? (
                  <Text variant="bodyS" color="textBody" style={{ marginTop: 2 }}>
                    {o.sub}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {choice === 'other' ? (
        <>
          <View
            style={{
              minHeight: 88,
              borderRadius: 16,
              paddingVertical: focused ? 11 : 12,
              paddingHorizontal: focused ? 13 : 14,
              backgroundColor: c.input,
              borderWidth: focused ? 2 : 1,
              borderColor: focused ? c.primary : c.input,
            }}>
            <TextInput
              value={other}
              onChangeText={(t) => setOther(t.slice(0, HIRE_OTHER_MAX))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              multiline
              autoFocus
              maxLength={HIRE_OTHER_MAX}
              placeholder="Tell us in a few words"
              placeholderTextColor={c.textLightSecondary}
              selectionColor={c.primary}
              accessibilityLabel="Your answer"
              style={[{ flex: 1, padding: 0, minHeight: 60, fontFamily: fontFamily('sans', 400), fontSize: 15, lineHeight: 22, color: c.textHeadline, textAlignVertical: 'top' }, { outlineStyle: 'none' } as object]}
            />
          </View>
          <Text variant="caption" weight={400} color="textLightSecondary" align="right" style={{ marginTop: -6 }}>
            {other.length} / {HIRE_OTHER_MAX}
          </Text>
        </>
      ) : null}

      <View style={{ gap: 2 }}>
        <Button size="l" label="Send answer" disabled={!ready} onPress={send} />
        <Pressable onPress={onLater} accessibilityRole="button" style={{ height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" weight={700} style={{ fontSize: 15 }}>
            Ask me later
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
