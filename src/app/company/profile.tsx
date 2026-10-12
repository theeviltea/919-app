import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Field, Icon, Pressable, Text, useToast } from '@/components';
import { useEmployer } from '@/data/employer';
import { personPhoto } from '@/data/mock';
import { positions } from '@/data/registration';
import { PhotoSheet } from '@/features/auth/PhotoSheet';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { Panel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

const nameErr = (v: string) => (v.trim() && !/^[\p{L}' -]+$/u.test(v.trim()) ? 'Letters only' : undefined);
const emailErr = (v: string) => (!/^\S+@\S+\.\S+$/.test(v.trim()) ? 'Check the email address' : undefined);

/** Employer — Your profile (EmpEditRep): photo, name, position, work email; the phone is the login. */
export default function EmployerRepEdit() {
  const { c } = useTheme();
  const toast = useToast();
  const { rep, setRep } = useEmployer();
  const [f, setF] = useState(rep);
  const [sheet, setSheet] = useState<'photo' | 'position' | null>(null);
  const set = (u: Partial<typeof f>) => setF((x) => ({ ...x, ...u }));
  const dirty = JSON.stringify({ ...f, photo: 0 }) !== JSON.stringify({ ...rep, photo: 0 }) || f.photo !== rep.photo;
  const ok = f.firstName.trim() && f.lastName.trim() && f.position && !nameErr(f.firstName) && !nameErr(f.lastName) && !emailErr(f.email);

  const save = () => {
    setRep({ ...f, firstName: f.firstName.trim(), lastName: f.lastName.trim(), email: f.email.trim() });
    toast({ text: 'Changes saved', icon: 'check' });
    router.back();
  };

  return (
    <SubScreen title="Your profile" footer={<Button size="l" label="Save changes" disabled={!ok || !dirty} onPress={save} />}>
      <Panel style={{ alignItems: 'center', gap: 6 }}>
        <Pressable onPress={() => setSheet('photo')} accessibilityRole="button" accessibilityLabel="Change your photo" style={{ width: 96, height: 96 }}>
          <Image source={f.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: c.backDarker }} />
          <View style={{ position: 'absolute', right: -4, bottom: -4, width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: c.surface, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="camera" size={16} color="textBody" />
          </View>
        </Pressable>
        <Text variant="body" weight={700} style={{ marginTop: 10, fontSize: 15 }}>
          Your photo *
        </Text>
        <Text variant="bodyS" color="textBody" align="center" style={{ fontSize: 13 }}>
          Candidates see it in chats and on vacancies
        </Text>
      </Panel>

      <Panel title="About you" gap={8}>
        <Field onSurface label="First name" required value={f.firstName} onChangeText={(v) => set({ firstName: v })} error={nameErr(f.firstName)} autoComplete="given-name" />
        <Field onSurface label="Last name" required value={f.lastName} onChangeText={(v) => set({ lastName: v })} error={nameErr(f.lastName)} autoComplete="family-name" />
        <Field onSurface label="Position" required value={f.position} onPress={() => setSheet('position')} rightIcon="chevron-down" />
      </Panel>

      <Panel gap={8}>
        <View style={{ gap: 2, marginBottom: 4 }}>
          <Text variant="bodyL" weight={700} accessibilityRole="header">
            Contacts
          </Text>
          <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
            Candidates see them only after you invite them
          </Text>
        </View>
        <Field onSurface label="Work email" required value={f.email} onChangeText={(v) => set({ email: v })} error={f.email.trim() ? emailErr(f.email) : 'Required'} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <Field onSurface label="Phone" required value={f.phone} locked right={<Icon name="lock" size={18} color="textLightSecondary" />} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <Icon name="lock" size={16} color="textBody" />
          <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>
            The phone number is your login. Change it in Privacy and security.
          </Text>
        </View>
      </Panel>

      <PhotoSheet visible={sheet === 'photo'} title="Your photo" onClose={() => setSheet(null)} sample={personPhoto(10)} square onPicked={([p]) => p && set({ photo: p })} />
      <SelectSheet visible={sheet === 'position'} title="Position" options={positions.includes(f.position) ? positions : [f.position, ...positions]} value={f.position} onClose={() => setSheet(null)} onSelect={(v) => (set({ position: v }), setSheet(null))} />
    </SubScreen>
  );
}
