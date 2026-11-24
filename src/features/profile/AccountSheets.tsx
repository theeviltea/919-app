import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Text } from '@/components';
import { useSession } from '@/data/session';
import { useSignup } from '@/data/signup';
import { useTheme } from '@/theme';

import { SheetHero } from './ui';

/** Leaves the current account (or all of them). With another account on the phone the app switches to it; otherwise back to the guest zone. */
function useLeave() {
  const { signOut, accounts } = useSession();
  const { reset } = useSignup();
  return (scope: 'current' | 'all' = 'current') => {
    signOut(scope);
    if (scope === 'current' && accounts.length > 1) return;
    reset();
    if (router.canDismiss()) router.dismissAll();
    router.replace('/guest');
  };
}

export function LogoutSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { c } = useTheme();
  const leave = useLeave();
  const { user, accounts } = useSession();
  const next = accounts.find((a) => a.id !== user?.id);
  if (next && user) {
    // AccLogout: two or more accounts on the phone.
    return (
      <BottomSheet visible={visible} onClose={onClose}>
        <SheetHero icon="logout" tone="neutral" title="Log out?" text={`You’ll stay signed in to ${next.name} and switch to it.`} />
        <View style={{ gap: 12, marginTop: 8 }}>
          <Button size="l" variant="destructive" label={`Log out of ${user.name}`} onPress={() => (onClose(), leave('current'))} />
          <Pressable
            onPress={() => (onClose(), leave('all'))}
            accessibilityRole="button"
            style={{ height: 56, borderRadius: 18, borderWidth: 1, borderColor: c.dangerBack, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="bodyL" weight={600} color="dangerText">
              Log out of all accounts
            </Text>
          </Pressable>
          <Button size="l" variant="neutral" label="Cancel" onPress={onClose} />
        </View>
      </BottomSheet>
    );
  }
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <SheetHero icon="logout" tone="neutral" title="Log out?" text="You can sign in again any time with your phone number or email." />
      <View style={{ gap: 12, marginTop: 8 }}>
        <Button size="l" variant="destructive" label="Log out" onPress={() => (onClose(), leave())} />
        <Button size="l" variant="neutral" label="Cancel" onPress={onClose} />
      </View>
    </BottomSheet>
  );
}

const LOSSES = ['Your profile, photos, video, applications and chats', 'Your Premium subscription will be canceled', 'Payments for the current period are not refunded'];

export function DeleteAccountSheet({ visible, onClose, losses = LOSSES }: { visible: boolean; onClose: () => void; losses?: string[] }) {
  const { c } = useTheme();
  const leave = useLeave();
  const [sure, setSure] = useState(false);
  const close = () => (setSure(false), onClose());
  return (
    <BottomSheet visible={visible} onClose={close}>
      <SheetHero icon="trash" tone="danger" title="Delete account?" text="This can’t be undone. Everything linked to your account will be deleted for good." />
      <View style={{ backgroundColor: c.input, borderRadius: 16, padding: 14, gap: 8 }}>
        {losses.map((t) => (
          <View key={t} style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ marginTop: 2 }}>
              <Icon name="cancel" size={16} color="dangerText" />
            </View>
            <Text variant="body" color="textPrimary" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
              {t}
            </Text>
          </View>
        ))}
      </View>
      <Pressable onPress={() => setSure(!sure)} accessibilityRole="checkbox" accessibilityState={{ checked: sure }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}>
        <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: sure ? 0 : 2, borderColor: c.control, backgroundColor: sure ? '#E0123F' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {sure ? <Icon name="check" size={14} color="#FFFFFF" /> : null}
        </View>
        <Text variant="body" color="textPrimary" style={{ fontSize: 14 }}>
          I understand that this can’t be undone
        </Text>
      </Pressable>
      <Button size="l" variant="destructive" label="Delete account" disabled={!sure} onPress={() => (close(), leave())} />
      <Button size="l" variant="neutral" label="Cancel" onPress={close} />
    </BottomSheet>
  );
}
