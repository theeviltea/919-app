import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Chip, Field, Icon, Text } from '@/components';
import type { Vacancy } from '@/data/types';
import { useTheme } from '@/theme';

const QUICK = ['I can start this week', 'I have similar experience', 'Available on weekends'];

/** Respond → optional message (≤500) with quick suggestions; Send application works without a message (§10). */
export function ApplySheet({ v, visible, onClose, onSend }: { v: Vacancy; visible: boolean; onClose: () => void; onSend: (message: string) => void }) {
  const { c } = useTheme();
  const [msg, setMsg] = useState('');
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Image source={v.cover} contentFit="cover" style={{ width: 44, height: 44, borderRadius: 12 }} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyL" weight={700} accessibilityRole="header">
            Apply to this vacancy
          </Text>
          <Text variant="bodyS" color="textBody" numberOfLines={1}>
            {v.title} · {v.company.name}
          </Text>
        </View>
      </View>
      <Field onSurface label="Message to the employer · optional" multiline maxLength={500} counter value={msg} onChangeText={setMsg} placeholder="Tell them why you’re a good fit or when you can start" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {QUICK.map((q) => (
          <Chip key={q} label={q} onPress={() => setMsg((m) => (m.includes(q) ? m : `${m.trim()}${m.trim() ? '. ' : ''}${q}`).slice(0, 500))} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, backgroundColor: c.primarySecondary }}>
        <Icon name="user" size={18} color="link" />
        <Text variant="bodyS" color="textPrimary" style={{ flex: 1 }}>
          The employer will see your profile, photos and video presentation.
        </Text>
      </View>
      <Button label="Send application" icon="arrow-right" onPress={() => (onSend(msg), setMsg(''))} />
    </BottomSheet>
  );
}
