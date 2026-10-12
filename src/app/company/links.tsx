import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Field, Icon, Text, useToast } from '@/components';
import { useEmployer } from '@/data/employer';
import { Panel, SubScreen } from '@/features/profile/ui';

const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());

/** Employer — Contacts and links (EmpEditLinks): what candidates see on the Company tab. */
export default function CompanyLinksEdit() {
  const toast = useToast();
  const { info, setInfo } = useEmployer();
  const keys = ['phone', 'email', 'office', 'website', 'instagram', 'linkedin', 'facebook'] as const;
  const [f, setF] = useState(() => Object.fromEntries(keys.map((k) => [k, info[k]])) as Record<(typeof keys)[number], string>);
  const set = (u: Partial<typeof f>) => setF((x) => ({ ...x, ...u }));
  const dirty = keys.some((k) => f[k] !== info[k]);
  const ok = f.phone.replace(/\D/g, '').length >= 7 && emailOk(f.email);

  const save = () => {
    setInfo(Object.fromEntries(keys.map((k) => [k, f[k].trim()])));
    toast({ text: 'Changes saved', icon: 'check' });
    router.back();
  };

  return (
    <SubScreen title="Contacts and links" footer={<Button size="l" label="Save changes" disabled={!ok || !dirty} onPress={save} />}>
      <Panel gap={8}>
        <View style={{ gap: 2, marginBottom: 4 }}>
          <Text variant="bodyL" weight={700} accessibilityRole="header">
            Contacts
          </Text>
          <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
            Shown on the Company tab
          </Text>
        </View>
        <Field onSurface label="Contact phone" required value={f.phone} onChangeText={(v) => set({ phone: v })} keyboardType="phone-pad" right={<Icon name="call" size={18} color="textBody" />} />
        <Field
          onSurface
          label="Contact email"
          required
          value={f.email}
          onChangeText={(v) => set({ email: v })}
          error={f.email.trim() && !emailOk(f.email) ? 'Check the email address' : undefined}
          keyboardType="email-address"
          autoCapitalize="none"
          right={<Icon name="mail" size={18} color="textBody" />}
        />
        <Field onSurface label="Office address" value={f.office} onChangeText={(v) => set({ office: v })} right={<Icon name="location" size={18} color="textBody" />} />
      </Panel>

      <Panel title="Website and social" gap={8}>
        <Field onSurface label="Website" value={f.website} onChangeText={(v) => set({ website: v })} autoCapitalize="none" placeholder="yourcompany.com" right={<Icon name="globe" size={18} color="textBody" />} />
        <Field onSurface label="Instagram" value={f.instagram} onChangeText={(v) => set({ instagram: v })} autoCapitalize="none" placeholder="@company" />
        <Field onSurface label="LinkedIn" value={f.linkedin} onChangeText={(v) => set({ linkedin: v })} autoCapitalize="none" placeholder="linkedin.com/company/…" />
        <Field onSurface label="Facebook" value={f.facebook} onChangeText={(v) => set({ facebook: v })} placeholder="Page name or link" />
      </Panel>
    </SubScreen>
  );
}
