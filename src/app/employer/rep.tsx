import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Field, FormScreen, Icon, Pressable, StepProgress, Text } from '@/components';
import { positions } from '@/data/registration';
import { useSignup } from '@/data/signup';
import { PhotoSheet } from '@/features/auth/PhotoSheet';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { useTheme } from '@/theme';

const SAMPLE = require('@/assets/images/mock/people/p3.jpg');
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const lettersOnly = (s: string) => /^[\p{L}\s'-]*$/u.test(s);

/** Employer sign-up — the representative candidates will talk to. Phone comes from sign-in when there is one. */
export default function Representative() {
  const { c } = useTheme();
  const { employer: e, setEmployer } = useSignup();
  const [sheet, setSheet] = useState<'photo' | 'position' | null>(null);
  const single = e.mode === 'private';
  const nameErr = (v: string) => (v && !lettersOnly(v) ? 'Use letters only, without symbols' : undefined);
  const phoneDigits = e.phone.replace(/\D/g, '');
  const ok = !!e.photo && e.firstName.trim() && e.lastName.trim() && !nameErr(e.firstName) && !nameErr(e.lastName) && (single || e.position) && isEmail(e.email) && phoneDigits.length >= 9;

  const next = () => {
    if (e.mode === 'join') router.push('/employer/join');
    else if (e.mode === 'private') router.push({ pathname: '/employer/review', params: { mode: 'private' } });
    else router.push('/employer/company');
  };

  return (
    <FormScreen
      top={<StepProgress step={1} of={single ? 1 : 2} />}
      title="Who's hiring?"
      subtitle="The contact person candidates will talk to. Fields marked * are required."
      footer={<Button size="l" label={single ? 'Send for verification' : 'Continue'} disabled={!ok} onPress={next} />}>
      <Card padding={20} style={{ alignItems: 'center', gap: 6 }}>
        <Pressable onPress={() => setSheet('photo')} accessibilityRole="button" accessibilityLabel={e.photo ? 'Change your photo' : 'Add your photo'}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {e.photo ? <Image source={e.photo} contentFit="cover" style={{ width: 88, height: 88 }} /> : <Icon name="camera" size={30} color="textBody" />}
          </View>
          <View style={{ position: 'absolute', right: -2, bottom: -2, width: 32, height: 32, borderRadius: 16, backgroundColor: c.primary, borderWidth: 3, borderColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="camera" size={16} color="ctaButtonText" />
          </View>
        </Pressable>
        <Text variant="body" weight={700} style={{ marginTop: 8 }}>
          Your photo *
        </Text>
        <Text variant="bodyS" color="textBody">
          {e.photo ? 'Tap the camera to change it' : 'Candidates trust a real face'}
        </Text>
      </Card>
      <View style={{ gap: 8 }}>
        <Field label="First name" required value={e.firstName} onChangeText={(v) => setEmployer({ firstName: v })} placeholder="Enter" error={nameErr(e.firstName)} />
        <Field label="Last name" required value={e.lastName} onChangeText={(v) => setEmployer({ lastName: v })} placeholder="Enter" error={nameErr(e.lastName)} />
        {single ? null : <Field label="Position" required value={e.position} placeholder="Select" onPress={() => setSheet('position')} rightIcon="chevron-down" />}
        <Field label={single ? 'Email' : 'Work email'} required value={e.email} onChangeText={(v) => setEmployer({ email: v })} placeholder="name@company.com" keyboardType="email-address" autoCapitalize="none" />
        <Field
          label="Phone"
          required
          value={e.phone}
          onChangeText={(v) => setEmployer({ phone: v })}
          placeholder="+971 50 000 0000"
          keyboardType="phone-pad"
          locked={e.phoneLocked}
          right={e.phoneLocked ? <Icon name="lock" size={18} color="textBody" /> : undefined}
        />
        <Text variant="caption" weight={400} color="textBody" style={{ paddingHorizontal: 4 }}>
          {e.phoneLocked ? 'Taken from sign-in. You can change it later in Settings.' : 'You signed in with email or Apple / Google — add a phone candidates can call.'}
        </Text>
      </View>
      <PhotoSheet visible={sheet === 'photo'} title="Your photo" onClose={() => setSheet(null)} sample={SAMPLE} square onPicked={([p]) => setEmployer({ photo: p })} />
      <SelectSheet visible={sheet === 'position'} title="Position" options={positions} value={e.position} onClose={() => setSheet(null)} onSelect={(v) => (setEmployer({ position: v }), setSheet(null))} />
    </FormScreen>
  );
}
