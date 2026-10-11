import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, BottomSheet, Button, Row, RowGroup, StatusChip, Text, Toggle, useToast } from '@/components';
import { useSeeker } from '@/data/seeker';
import { useSession } from '@/data/session';
import { useTheme } from '@/theme';

type Sheet = 'logout' | 'delete' | null;

/** Seeker settings: notifications, privacy, subscription, legal, account. */
export default function Settings() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { signOut } = useSession();
  const { hidden, setHidden } = useSeeker();
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const soon = (what: string) => toast({ text: `${what} — coming in the next stage`, kind: 'neutral', icon: 'clock' });

  const leave = () => {
    setSheet(null);
    signOut();
    if (router.canDismiss()) router.dismissAll();
    router.replace('/guest');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: insets.bottom + 32, gap: 20, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <View style={{ gap: 16 }}>
          <BackButton />
          <Text variant="displayL" accessibilityRole="header" style={{ fontSize: 24, lineHeight: 30 }}>
            Settings
          </Text>
        </View>

        <RowGroup title="Notifications">
          <Row icon="notification" title="Push notifications" subtitle="Replies, invites, application status" right={<Toggle value={push} onValueChange={setPush} accessibilityLabel="Push notifications" />} />
          <Row icon="mail" title="Email digest" subtitle="New vacancies that fit you, weekly" right={<Toggle value={email} onValueChange={setEmail} accessibilityLabel="Email digest" />} last />
        </RowGroup>

        <RowGroup title="Privacy">
          <Row
            icon="view"
            title="Show my profile to employers"
            subtitle={hidden ? 'Hidden · only employers you applied to see it' : 'Employers can find you and send contact requests'}
            right={<Toggle value={!hidden} onValueChange={(v) => setHidden(!v)} accessibilityLabel="Show my profile to employers" />}
          />
          <Row icon="cancel" title="Blocked employers" subtitle="Manage who can’t contact you" onPress={() => soon('Blocked employers')} last />
        </RowGroup>

        <RowGroup title="Subscription">
          <Row icon="star" title="919 Free" subtitle="Unlimited applications · Premium boosts your profile" right={<StatusChip kind="new" label="Current" icon={null} />} onPress={() => soon('Premium')} last />
        </RowGroup>

        <RowGroup title="Account">
          <Row icon="call" title="Phone" subtitle="+971 50 123 4567" onPress={() => soon('Change phone')} />
          <Row icon="lock" title="Password" onPress={() => router.push('/auth/forgot')} />
          <Row icon="globe" title="Language" subtitle="English" onPress={() => soon('Languages')} last />
        </RowGroup>

        <RowGroup title="About">
          <Row icon="alert-circle" title="Help & support" onPress={() => soon('Support')} />
          <Row icon="lock" title="Privacy policy" onPress={() => soon('Privacy policy')} />
          <Row icon="briefcase" title="Terms of use" onPress={() => soon('Terms of use')} last />
        </RowGroup>

        <RowGroup>
          <Row icon="logout" title="Log out" danger onPress={() => setSheet('logout')} />
          <Row icon="trash" title="Delete account" danger onPress={() => setSheet('delete')} last />
        </RowGroup>

        <Text variant="caption" weight={400} color="textLightSecondary" align="center">
          919 · version 0.3 prototype
        </Text>
      </ScrollView>

      <BottomSheet visible={sheet === 'logout'} onClose={() => setSheet(null)} title="Log out?" subtitle="You can sign in again with your phone number.">
        <Button variant="danger" label="Log out" onPress={leave} />
        <Button variant="neutral" label="Cancel" onPress={() => setSheet(null)} />
      </BottomSheet>

      <BottomSheet visible={sheet === 'delete'} onClose={() => setSheet(null)} title="Delete account?" subtitle="Your profile, applications and chats will be deleted in 30 days. Sign in before then to cancel.">
        <Button variant="danger" label="Delete account" onPress={leave} />
        <Button variant="neutral" label="Cancel" onPress={() => setSheet(null)} />
      </BottomSheet>
    </View>
  );
}
