import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Pressable, Row, Text, useToast } from '@/components';
import { DeleteAccountSheet, LogoutSheet } from '@/features/profile/AccountSheets';
import { GroupLabel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

function Group({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  return <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 4 }}>{children}</View>;
}

/** Seeker settings: account, subscription, legal, log out. Delete account is a quiet link under the card. */
export default function Settings() {
  const { c } = useTheme();
  const toast = useToast();
  const [sheet, setSheet] = useState<'logout' | 'delete' | null>(null);

  return (
    <SubScreen title="Settings">
      <GroupLabel>Account</GroupLabel>
      <Group>
        <Row icon="notification" title="Notifications" onPress={() => router.push('/profile/notifications')} />
        <Row icon="lock" title="Privacy and security" onPress={() => router.push('/profile/privacy')} last />
      </Group>

      <GroupLabel>Subscription</GroupLabel>
      <Group>
        <Row
          icon="star"
          tone="premium"
          title="Subscription"
          subtitle="Get Premium to stand out"
          chevron
          right={
            <View style={{ height: 28, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.input, justifyContent: 'center' }}>
              <Text variant="caption" weight={700} color="textBody">
                Free
              </Text>
            </View>
          }
          onPress={() => toast({ text: 'Premium for job seekers is coming soon', kind: 'paid', icon: 'star' })}
          last
        />
      </Group>

      <GroupLabel>Legal</GroupLabel>
      <Group>
        <Row icon="file" title="User agreement" onPress={() => router.push({ pathname: '/profile/legal', params: { doc: 'terms' } })} />
        <Row icon="shield" title="Privacy policy" onPress={() => router.push({ pathname: '/profile/legal', params: { doc: 'privacy' } })} last />
      </Group>

      <View style={{ marginTop: 0 }}>
        <Group>
          <Row icon="logout" title="Log out" danger onPress={() => setSheet('logout')} last />
        </Group>
      </View>

      <Pressable onPress={() => setSheet('delete')} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12 }}>
        <Text variant="bodyS" weight={500} color="textLightSecondary" style={{ fontSize: 13, textDecorationLine: 'underline' }}>
          Delete account
        </Text>
      </Pressable>
      <Text variant="bodyS" color="textLightSecondary" align="center" style={{ fontSize: 13, paddingBottom: 24 }}>
        919 · version 2.0.0
      </Text>

      <LogoutSheet visible={sheet === 'logout'} onClose={() => setSheet(null)} />
      <DeleteAccountSheet visible={sheet === 'delete'} onClose={() => setSheet(null)} />
    </SubScreen>
  );
}
