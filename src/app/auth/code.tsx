import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, FormScreen, Icon, OTPField, Pressable, ResendTimer, Text, useToast } from '@/components';
import { useSeeker } from '@/data/seeker';
import { maskPhone } from '@/features/auth/PhoneInput';
import { useAfterContact } from '@/features/auth/useCreateAccount';
import { useFinishAuth } from '@/features/auth/useFinishAuth';
import { useTheme } from '@/theme';

type Flow = 'signin' | 'signup' | 'email' | 'forgot' | 'phone';

// Prototype rules: 000000 is a wrong code, anything else passes.
const WRONG = '000000';

/** OTP for phone sign-in / sign-up, email confirmation and password reset. Auto-submits on the 6th digit. */
export default function Code() {
  const { flow = 'signin', to = '', mode } = useLocalSearchParams<{ flow?: Flow; to?: string; mode?: 'change' | 'add' }>();
  const { c } = useTheme();
  const finish = useFinishAuth();
  const afterContact = useAfterContact();
  const toast = useToast();
  const { updateProfile } = useSeeker();
  const [code, setCode] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [error, setError] = useState<string>();
  const [left, setLeft] = useState(60);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const [dial, digits] = to.split('|');
  const target = flow === 'email' || flow === 'forgot' ? to : maskPhone(dial ?? '', digits ?? '');
  const expired = left <= 0;

  const submit = (v: string) => {
    if (v === WRONG) {
      const a = attempts - 1;
      setAttempts(a);
      setError(a > 0 ? `Incorrect code. ${a} attempt${a === 1 ? '' : 's'} left` : 'Too many attempts. Request a new code.');
      return;
    }
    if (flow === 'phone') {
      const d = digits ?? '';
      updateProfile({ phone: `${dial} ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}` });
      router.dismissTo('/profile/personal');
      toast({ text: mode === 'add' ? 'Phone number added' : 'Phone number updated', icon: 'check', aboveTabBar: true });
    } else if (flow === 'signin') finish({ phone: to });
    else if (flow === 'forgot') router.replace({ pathname: '/auth/new-password', params: { email: to } });
    else afterContact(flow === 'email' ? { email: to } : { phone: to });
  };

  const resend = () => {
    setLeft(60);
    setCode('');
    setError(undefined);
    setAttempts(3);
  };

  return (
    <FormScreen
      title="Enter the code"
      subtitle={
        <View style={{ gap: 6 }}>
          <Text variant="body" color="textPrimary" style={{ fontSize: 14 }}>
            Sent {flow === 'email' || flow === 'forgot' ? 'to' : 'by SMS to'}{' '}
            <Text variant="body" weight={700} style={{ fontSize: 14 }}>
              {target}
            </Text>
          </Text>
          <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ alignSelf: 'flex-start' }}>
            <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
              {flow === 'email' || flow === 'forgot' ? 'Change email' : 'Change number'}
            </Text>
          </Pressable>
        </View>
      }
      footer={expired ? <Button size="l" label="Send code again" onPress={resend} /> : undefined}>
      <View style={{ gap: 14, marginTop: 8 }}>
        <OTPField
          value={code}
          onChange={(v) => {
            setCode(v);
            if (error) setError(undefined);
          }}
          onComplete={submit}
          error={error}
        />
        {expired ? (
          <View style={{ flexDirection: 'row', gap: 12, padding: 14, borderRadius: 16, backgroundColor: c.surface }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.infoBack, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="clock" size={18} color="infoText" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight={700} style={{ fontSize: 14 }}>
                The code has expired
              </Text>
              <Text variant="bodyS" color="textBody">
                Request a new one. We’ll send it to the same {flow === 'email' || flow === 'forgot' ? 'email' : 'number'}.
              </Text>
            </View>
          </View>
        ) : (
          <ResendTimer seconds={left} onResend={resend} />
        )}
      </View>
      <View style={{ flex: 1 }} />
      {!expired ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, backgroundColor: c.surface }}>
          <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="flash" size={16} color="onUrgent" />
          </View>
          <Text variant="bodyS" color="textPrimary" style={{ flex: 1 }}>
            The code is checked automatically as soon as you enter the last digit. Prototype: 000000 shows the error state.
          </Text>
        </View>
      ) : null}
    </FormScreen>
  );
}
