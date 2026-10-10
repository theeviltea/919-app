import { router } from 'expo-router';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { AuthSheet, Text, type AuthMethod } from '@/components';
import { useSession, type Role } from '@/data/session';
import { useTheme } from '@/theme';

type Ctx = { title: string; subtitle: string; image?: number | object; tone?: 'round' | 'square' };

/** Opens sign-in for a guest action and remembers where to come back to. */
export function useGuestAuthRoutes() {
  const { setReturn } = useSession();
  return {
    go(method: AuthMethod | 'create', role: Role, returnTo: string) {
      setReturn(returnTo, role);
      if (method === 'create') router.push('/auth/register');
      else if (method === 'phone') router.push('/auth/sign-in');
      else if (method === 'email') router.push('/auth/email');
      else router.push({ pathname: '/auth/register', params: { social: method } });
    },
  };
}

export function GuestAuthSheet({ visible, onClose, role, title, subtitle, context, returnTo }: { visible: boolean; onClose: () => void; role: Role; title: string; subtitle: string; context?: Ctx; returnTo: string }) {
  const { c } = useTheme();
  const { go } = useGuestAuthRoutes();
  const done = (m: AuthMethod | 'create') => {
    onClose();
    go(m, role, returnTo);
  };
  return (
    <AuthSheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      role={role}
      onMethod={done}
      onCreateAccount={() => done('create')}
      context={
        context ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 16, backgroundColor: c.input }}>
            {context.image ? (
              <Image source={context.image} contentFit="cover" style={{ width: 48, height: 48, borderRadius: context.tone === 'round' ? 24 : 12 }} />
            ) : null}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="body" weight={700} numberOfLines={1}>
                {context.title}
              </Text>
              <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 2 }}>
                {context.subtitle}
              </Text>
            </View>
          </View>
        ) : null
      }
    />
  );
}
