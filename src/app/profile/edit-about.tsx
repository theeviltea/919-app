import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, Field, FormScreen, Text } from '@/components';
import { useSeeker } from '@/data/seeker';

const HINTS = ['Where you worked', 'What you are best at', 'Languages', 'When you can work'];

/** Edit "About you" — the short text employers read first. */
export default function EditAbout() {
  const { profile, updateProfile } = useSeeker();
  const [text, setText] = useState(profile.about);
  return (
    <FormScreen
      title="About you"
      subtitle="A few lines about your experience. Employers read this first."
      footer={<Button size="l" label="Save" disabled={text.trim().length < 20} onPress={() => (updateProfile({ about: text.trim() }), router.back())} />}>
      <Field label="About" required multiline maxLength={600} counter value={text} onChangeText={setText} placeholder="Five years in hospitality, from beach clubs to fine dining…" autoFocus />
      <Text variant="bodyS" color="textBody">
        Good to mention
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {HINTS.map((h) => (
          <Chip key={h} label={h} />
        ))}
      </View>
      {text.trim().length > 0 && text.trim().length < 20 ? (
        <Text variant="bodyS" color="attentionText">
          Write at least 20 characters
        </Text>
      ) : null}
    </FormScreen>
  );
}
