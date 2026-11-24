import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Icon, Text } from '@/components';
import { MAX_ACCOUNTS, useSession } from '@/data/session';
import { AccountAvatar } from '@/features/accounts/ui';
import { SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

/** Add account (AccAdd): sign in to another 919 account or create one; the current account stays signed in. */
export default function AddAccount() {
  const { c } = useTheme();
  const { user, setAdding, setPendingRole } = useSession();
  const start = (to: '/accounts/sign-in' | '/auth/role') => {
    setAdding(true);
    setPendingRole(null);
    router.push(to);
  };
  return (
    <SubScreen title="Add account" gap={16}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 8, paddingVertical: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {user ? (
            <View style={{ padding: 4, borderRadius: user.role === 'seeker' ? 46 : 30, backgroundColor: c.back, zIndex: 1 }}>
              <AccountAvatar account={user} size={84} />
            </View>
          ) : null}
          <View style={{ marginLeft: -18, width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderStyle: 'dashed', borderColor: c.textLightSecondary, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="add" size={30} color="link" />
          </View>
        </View>
        <Text variant="displayM" align="center" accessibilityRole="header" style={{ fontSize: 22, lineHeight: 29 }}>
          Add another account
        </Text>
        <Text variant="body" color="textBody" align="center" style={{ fontSize: 15, lineHeight: 22 }}>
          Keep a job seeker and an employer account on one phone and switch between them in a tap. You stay signed in to{' '}
          <Text variant="body" weight={700} style={{ fontSize: 15, lineHeight: 22 }}>
            {user?.name ?? 'your account'}
          </Text>
          .
        </Text>
      </View>
      <Button size="l" label="Sign in to an existing account" onPress={() => start('/accounts/sign-in')} />
      <Button size="l" variant="secondary" label="Create a new account" onPress={() => start('/auth/role')} />
      <Text variant="bodyS" color="textBody" align="center" style={{ fontSize: 13, paddingBottom: 10 }}>
        Up to {MAX_ACCOUNTS} accounts on one phone
      </Text>
    </SubScreen>
  );
}
