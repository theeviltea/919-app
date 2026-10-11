import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Icon, Pressable, Row, Text, Toggle, useToast } from '@/components';
import { useSeeker } from '@/data/seeker';
import { DeleteAccountSheet } from '@/features/profile/AccountSheets';
import { GroupLabel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

function Group({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  return <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 4 }}>{children}</View>;
}

const mask = (phone: string) => phone.replace(/(\+\d+ \d{2}) \d{3} (\d+)/, (_, a, b) => `${a} ••• ${b}`);

/** Privacy and security: sign-in methods, what employers see, devices. */
export default function Privacy() {
  const { c } = useTheme();
  const toast = useToast();
  const { profile, prefs, setPref, threads } = useSeeker();
  const [others, setOthers] = useState(true);
  const [del, setDel] = useState(false);
  const blocked = threads.filter((t) => t.state === 'blocked').length;

  return (
    <SubScreen title="Privacy and security">
      <GroupLabel>Sign-in</GroupLabel>
      <Group>
        <Row
          icon="phone"
          title="Phone number"
          subtitle={profile.phone ? mask(profile.phone) : 'Not added'}
          onPress={() => router.push({ pathname: '/profile/phone', params: { mode: profile.phone ? 'change' : 'add' } })}
        />
        <Row icon="mail" title="Email" subtitle={profile.email ?? 'Not added'} onPress={() => router.push('/profile/personal')} />
        <Row icon="lock" title="Face ID" subtitle="Unlock 919 without a code" right={<Toggle value={!!prefs.faceId} onValueChange={(v) => setPref('faceId', v)} accessibilityLabel="Face ID" />} last />
      </Group>

      <GroupLabel>Privacy</GroupLabel>
      <Group>
        <Row title="Show my age" subtitle="Otherwise employers see only your age range" right={<Toggle value={!!prefs.showAge} onValueChange={(v) => setPref('showAge', v)} accessibilityLabel="Show my age" />} />
        <Row title="Read receipts" subtitle="Employers see when you read their messages" right={<Toggle value={!!prefs.readReceipts} onValueChange={(v) => setPref('readReceipts', v)} accessibilityLabel="Read receipts" />} />
        <Row
          title="Blocked employers"
          chevron
          right={
            <Text variant="body" color="textBody" style={{ fontSize: 15 }}>
              {blocked}
            </Text>
          }
          onPress={() => toast({ text: blocked ? 'Unblock an employer from the chat menu' : 'You haven’t blocked anyone', kind: 'neutral', icon: 'cancel' })}
          last
        />
      </Group>

      <GroupLabel>Active sessions</GroupLabel>
      <Group>
        <Row
          icon="lock"
          tone="neutral"
          title="iPhone 15"
          subtitle={`${profile.city ?? 'Dubai'} · now`}
          right={
            <View style={{ height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: c.successBack, justifyContent: 'center' }}>
              <Text variant="caption" weight={700} color="successText">
                This device
              </Text>
            </View>
          }
          last={!others}
        />
        {others ? <Row icon="lock" tone="neutral" title="MacBook Air · Safari" subtitle={`${profile.city ?? 'Dubai'} · 3 days ago`} chevron={false} last /> : null}
      </Group>
      {others ? (
        <Pressable
          onPress={() => (setOthers(false), toast({ text: 'Logged out of other devices', icon: 'check', aboveTabBar: true }))}
          accessibilityRole="button"
          style={{ height: 52, borderRadius: 20, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="logout" size={18} color="dangerText" />
          <Text variant="body" weight={700} color="dangerText" style={{ fontSize: 15 }}>
            Log out of other devices
          </Text>
        </Pressable>
      ) : null}

      <Group>
        <Row icon="trash" danger title="Delete account" subtitle="Your profile, applications and chats will be removed" onPress={() => setDel(true)} last />
      </Group>
      <DeleteAccountSheet visible={del} onClose={() => setDel(false)} />
    </SubScreen>
  );
}
