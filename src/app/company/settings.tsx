import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Row, Text, useToast } from '@/components';
import { EMPLOYER_LOSSES, useEmployer } from '@/data/employer';
import { DeleteAccountSheet, LogoutSheet } from '@/features/profile/AccountSheets';
import { VerificationRow } from '@/features/employer/VerificationRow';
import { ThemeRow } from '@/features/profile/ThemeRow';
import { GroupLabel, SheetHero, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

function Group({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  return <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 4 }}>{children}</View>;
}

/** Employer — Settings (EmpSettings): account, company, legal, leave / log out, delete. */
export default function EmployerSettings() {
  const { c } = useTheme();
  const toast = useToast();
  const { members, joinRequests, plan, info } = useEmployer();
  const [sheet, setSheet] = useState<'logout' | 'delete' | 'leave' | null>(null);
  const recruiters = members.filter((m) => m.role === 'Recruiter').length;
  const admins = members.filter((m) => m.role === 'Admin').length;

  return (
    <SubScreen title="Settings">
      <GroupLabel>Account</GroupLabel>
      <Group>
        <Row icon="notification" title="Notifications" subtitle="New applicants, messages, join requests" onPress={() => router.push('/profile/notifications')} />
        <Row icon="lock" title="Privacy and security" onPress={() => router.push('/company/privacy')} />
        <ThemeRow />
      </Group>

      <GroupLabel>Company</GroupLabel>
      <Group>
        <VerificationRow />
        <Row
          icon="users"
          title="Team and roles"
          subtitle={`${recruiters} recruiter${recruiters === 1 ? '' : 's'}${joinRequests.length ? ` · ${joinRequests.length} join request${joinRequests.length === 1 ? '' : 's'}` : ''}`}
          onPress={() => router.push('/company/team')}
        />
        <Row
          icon="star"
          tone="premium"
          title="Subscription"
          subtitle={plan === 'premium' ? 'Apple Pay · renews 9 Nov 2026' : plan === 'canceled' ? 'Premium until 9 Nov 2026' : 'Free plan · 1 active vacancy'}
          chevron
          right={
            plan !== 'free' ? (
              <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.labelOrangeBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="star" size={12} color="labelOrangeText" />
                <Text variant="caption" weight={700} color="labelOrangeText">
                  Premium
                </Text>
              </View>
            ) : (
              <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.input, justifyContent: 'center' }}>
                <Text variant="caption" weight={700} color="textBody">
                  Free
                </Text>
              </View>
            )
          }
          onPress={() => router.push('/company/subscription')}
          last
        />
      </Group>

      <GroupLabel>Legal</GroupLabel>
      <Group>
        <Row icon="file" title="User agreement" onPress={() => router.push({ pathname: '/profile/legal', params: { doc: 'bizTerms' } })} />
        <Row icon="shield" title="Privacy policy" onPress={() => router.push({ pathname: '/profile/legal', params: { doc: 'bizPrivacy' } })} last />
      </Group>

      <Group>
        <Row icon="building" danger title="Leave company" onPress={() => setSheet('leave')} />
        <Row icon="logout" danger title="Log out" onPress={() => setSheet('logout')} last />
      </Group>

      <Pressable onPress={() => setSheet('delete')} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12 }}>
        <Text variant="bodyS" weight={500} color="textLightSecondary" style={{ fontSize: 13, textDecorationLine: 'underline' }}>
          Delete account
        </Text>
      </Pressable>
      <Text variant="bodyS" color="textLightSecondary" align="center" style={{ fontSize: 13, paddingBottom: 24 }}>
        919 for business · version 2.0.0
      </Text>

      <LogoutSheet visible={sheet === 'logout'} onClose={() => setSheet(null)} />
      <DeleteAccountSheet visible={sheet === 'delete'} onClose={() => setSheet(null)} losses={EMPLOYER_LOSSES} />
      <BottomSheet visible={sheet === 'leave'} onClose={() => setSheet(null)}>
        {admins <= 1 ? (
          <>
            <SheetHero icon="building" tone="neutral" title="Make someone else Admin first" text={`You’re the only admin of ${info.name}. Give the Admin role to a teammate in Team and roles, then you can leave.`} />
            <View style={{ gap: 12, marginTop: 8 }}>
              <Button size="l" label="Open Team and roles" onPress={() => (setSheet(null), router.push('/company/team'))} />
              <Button size="l" variant="neutral" label="Cancel" onPress={() => setSheet(null)} />
            </View>
          </>
        ) : (
          <>
            <SheetHero icon="building" tone="danger" title={`Leave ${info.name}?`} text="You’ll lose access to the company’s vacancies, applicants and chats. Your personal account stays." />
            <View style={{ gap: 12, marginTop: 8 }}>
              <Button size="l" variant="destructive" label="Leave company" onPress={() => (setSheet(null), toast({ text: `You left ${info.name}`, icon: 'logout' }))} />
              <Button size="l" variant="neutral" label="Cancel" onPress={() => setSheet(null)} />
            </View>
          </>
        )}
      </BottomSheet>
    </SubScreen>
  );
}
