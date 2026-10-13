import { router } from 'expo-router';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Text, useToast } from '@/components';
import { useEmployer } from '@/data/employer';
import { useSession } from '@/data/session';
import { PremiumSheet } from '@/features/hire/PremiumSheet';
import { useTheme } from '@/theme';

type Gate = 'pending' | 'paywall' | null;
const Ctx = createContext<() => void>(() => router.push('/post/category'));

/** Entry to the new-vacancy flow. Checks verification (CompanyPendingSheet) and the Free plan limit (EmpPaywallVacancy) first. */
export const useStartVacancy = () => useContext(Ctx);

export function PostGateProvider({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  const toast = useToast();
  const { user } = useSession();
  const { plan, setPlan, vacancies, info } = useEmployer();
  const [gate, setGate] = useState<Gate>(null);
  const pending = user?.company?.status === 'pending';
  const live = vacancies.find((v) => v.status === 'active') ?? vacancies.find((v) => v.status === 'review');

  const start = useMemo(
    () => () => {
      if (pending) return setGate('pending');
      if (plan === 'free' && live) return setGate('paywall');
      router.push('/post/category');
    },
    [pending, plan, live],
  );
  const until = live?.note.split('until ')[1];

  return (
    <Ctx.Provider value={start}>
      {children}

      {/* CompanyPendingSheet */}
      <BottomSheet visible={gate === 'pending'} onClose={() => setGate(null)} closable>
        <View style={{ alignItems: 'center', paddingTop: 8 }}>
          <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="clock" size={32} color="textBody" />
          </View>
          <Text variant="title" align="center" style={{ marginTop: 16 }}>
            {'You can post vacancies\nafter verification'}
          </Text>
          <Text variant="body" color="textBody" align="center" style={{ marginTop: 10, fontSize: 14, lineHeight: 21 }}>
            The 919 team is checking {user?.company?.name || info.name}. It usually takes a few hours, and we’ll notify you as soon as it’s done.
          </Text>
        </View>
        <View style={{ borderRadius: 18, backgroundColor: c.back, paddingHorizontal: 14, paddingVertical: 2 }}>
          <View style={{ height: 48, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderColor: c.divider }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.successBack, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={14} color="successText" />
            </View>
            <Text variant="body" style={{ flex: 1, fontSize: 15 }}>
              Company details sent
            </Text>
          </View>
          <View style={{ height: 48, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="clock" size={14} color="textBody" />
            </View>
            <Text variant="body" weight={600} style={{ flex: 1, fontSize: 15 }}>
              Verification by 919
            </Text>
            <View style={{ height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: c.input, justifyContent: 'center' }}>
              <Text variant="caption" weight={700} color="textBody" style={{ fontSize: 12 }}>
                In progress
              </Text>
            </View>
          </View>
        </View>
        <View style={{ gap: 2 }}>
          <Button size="l" label="Got it" onPress={() => setGate(null)} />
          <Pressable
            onPress={() => {
              setGate(null);
              router.navigate('/hire');
            }}
            accessibilityRole="button"
            style={{ height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Icon name="users" size={18} color="textHeadline" />
            <Text variant="body" weight={700} style={{ fontSize: 15 }}>
              Browse talent meanwhile
            </Text>
          </Pressable>
        </View>
      </BottomSheet>

      {/* EmpPaywallVacancy */}
      <PremiumSheet
        visible={gate === 'paywall'}
        title="Post more than one vacancy"
        text={`Free plan includes 1 active vacancy. “${live?.title ?? ''}” ${live?.status === 'review' ? 'is on review now' : until ? `is live until ${until}` : 'is live now'}.`}
        onClose={() => setGate(null)}
        onSubscribe={() => {
          setPlan('premium');
          setGate(null);
          toast({ text: 'Premium is active. Welcome!', kind: 'paid', icon: 'star' });
          router.push('/post/category');
        }}
      />
    </Ctx.Provider>
  );
}
