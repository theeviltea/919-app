import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Icon, Pressable, Row, Text, Toggle, useToast } from '@/components';
import { EMPLOYER_LOSSES, useEmployer } from '@/data/employer';
import { useSeeker } from '@/data/seeker';
import { DeleteAccountSheet } from '@/features/profile/AccountSheets';
import { GroupLabel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

function Group({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  return <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 4 }}>{children}</View>;
}

const mask = (phone: string) => phone.replace(/(\+\d+ \d{2}) \d{3} (\d{2})(\d{2})/, (_, a, b, d) => `${a} ••• ${b} ${d}`);

/** Employer — Privacy and security (EmpPrivacy): sign-in, what candidates see, sessions, delete account. */
export default function EmployerPrivacy() {
  const { c } = useTheme();
  const toast = useToast();
  const { rep, threads } = useEmployer();
  const { prefs, setPref } = useSeeker();
  const [others, setOthers] = useState(true);
  const [del, setDel] = useState(false);
  const blocked = threads.filter((t) => t.reason === 'Blocked').length;

  return (
    <SubScreen title="Privacy and security">
      <GroupLabel>Sign-in</GroupLabel>
      <Group>
        <Row icon="phone" title="Phone number" subtitle={mask(rep.phone)} onPress={() => toast({ text: 'Changing the login phone goes through an SMS code — next stage', icon: 'phone' })} />
        <Row icon="mail" title="Email" subtitle={rep.email} onPress={() => router.push('/company/profile')} />
        <Row icon="lock" title="Face ID" subtitle="Unlock 919 without a code" right={<Toggle value={!!prefs.faceId} onValueChange={(v) => setPref('faceId', v)} accessibilityLabel="Face ID" />} last />
      </Group>

      <GroupLabel>Privacy</GroupLabel>
      <Group>
        <Row
          title="Show my name to candidates"
          subtitle="Otherwise candidates see only the company name"
          right={<Toggle value={!!prefs.showName} onValueChange={(v) => setPref('showName', v)} accessibilityLabel="Show my name to candidates" />}
        />
        <Row title="Show my phone in vacancies" subtitle="Candidates can call you directly" right={<Toggle value={!!prefs.showPhone} onValueChange={(v) => setPref('showPhone', v)} accessibilityLabel="Show my phone in vacancies" />} />
        <Row
          title="Blocked users"
          chevron
          right={
            <Text variant="body" color="textBody" style={{ fontSize: 15 }}>
              {blocked}
            </Text>
          }
          onPress={() => router.navigate('/hire/messages')}
          last
        />
      </Group>

      <GroupLabel>Active sessions</GroupLabel>
      <Group>
        <Row
          icon="lock"
          tone="neutral"
          title="iPhone 15 Pro"
          subtitle="Dubai · now"
          right={
            <View style={{ height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: c.successBack, justifyContent: 'center' }}>
              <Text variant="caption" weight={700} color="successText">
                This device
              </Text>
            </View>
          }
          last={!others}
        />
        {others ? <Row icon="lock" tone="neutral" title="iPad Air" subtitle="Dubai · 2 days ago" chevron={false} last /> : null}
      </Group>
      {others ? (
        <Pressable
          onPress={() => (setOthers(false), toast({ text: 'Logged out of other devices', icon: 'check' }))}
          accessibilityRole="button"
          style={{ height: 52, borderRadius: 20, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="logout" size={18} color="dangerText" />
          <Text variant="body" weight={700} color="dangerText" style={{ fontSize: 15 }}>
            Log out of other devices
          </Text>
        </Pressable>
      ) : null}

      <Group>
        <Row icon="trash" danger title="Delete account" subtitle="Your vacancies and chats will be removed" onPress={() => setDel(true)} last />
      </Group>
      <DeleteAccountSheet visible={del} onClose={() => setDel(false)} losses={EMPLOYER_LOSSES} />
    </SubScreen>
  );
}
