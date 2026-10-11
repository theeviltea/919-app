import { Image } from 'expo-image';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Text } from '@/components';
import type { Vacancy } from '@/data/types';
import { fontFamily, useTheme } from '@/theme';

const QUICK = ['I can start this week', 'I have similar experience', 'Available on weekends'];
const MAX = 500;

/** Respond → optional message (≤500) with quick suggestions; Send application works without a message (§10). */
export function ApplySheet({ v, visible, onClose, onSend }: { v: Vacancy; visible: boolean; onClose: () => void; onSend: (message: string) => void }) {
  const { c } = useTheme();
  const [msg, setMsg] = useState('');
  const [focused, setFocused] = useState(false);
  const empty = !msg.trim();
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Image source={v.cover} contentFit="cover" style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: c.backDarker }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="title" accessibilityRole="header" style={{ fontSize: 17, lineHeight: 22 }}>
            Apply to this vacancy
          </Text>
          <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 2, fontSize: 13 }}>
            {v.title} · {v.company.name}
          </Text>
        </View>
      </View>

      <View
        style={{
          minHeight: 120,
          borderRadius: 16,
          paddingVertical: focused ? 11 : 12,
          paddingHorizontal: focused ? 15 : 16,
          backgroundColor: c.input,
          borderWidth: focused ? 2 : 1,
          borderColor: focused ? c.primary : c.input,
          boxShadow: focused ? `0 0 0 4px ${c.focusRing}` : undefined,
        }}>
        <Text variant="caption" color="textBody">
          {empty && !focused ? 'Message to the employer · optional' : 'Message to the employer'}
        </Text>
        <TextInput
          value={msg}
          onChangeText={(t) => setMsg(t.slice(0, MAX))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline
          maxLength={MAX}
          placeholder="Tell them why you’re a good fit or when you can start"
          placeholderTextColor={c.textLightSecondary}
          selectionColor={c.primary}
          accessibilityLabel="Message to the employer"
          style={[{ flex: 1, marginTop: 4, padding: 0, minHeight: 80, fontFamily: fontFamily('sans', 400), fontSize: 15, lineHeight: 22, color: c.textHeadline, textAlignVertical: 'top' }, { outlineStyle: 'none' } as object]}
        />
      </View>
      {empty ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {QUICK.map((q) => (
            <Pressable
              key={q}
              onPress={() => setMsg(q)}
              accessibilityRole="button"
              style={{ height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: c.stroke, backgroundColor: c.surface, justifyContent: 'center' }}>
              <Text variant="bodyS" weight={600} style={{ fontSize: 13 }}>
                {q}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text variant="caption" weight={400} color="textLightSecondary" align="right" style={{ marginTop: -4 }}>
          {msg.length} / {MAX}
        </Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.primarySecondary }}>
        <Icon name="user" size={18} color="primary" />
        <Text variant="bodyS" color="textPrimary" style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>
          The employer will see your profile, photos and video presentation.
        </Text>
      </View>
      <Button size="l" icon="arrow-right" label="Send application" onPress={() => (onSend(msg.trim()), setMsg(''))} />
    </BottomSheet>
  );
}
