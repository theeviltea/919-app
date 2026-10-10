import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';

import { BrandMarkPlaceholder, Button, FormScreen, Icon, Pressable, Text } from '@/components';
import { OrDivider } from '@/components/AuthSheet';
import { popularCountries } from '@/data/dictionaries';
import { useSession } from '@/data/session';
import { PhoneInput } from '@/features/auth/PhoneInput';
import { useFinishAuth } from '@/features/auth/useFinishAuth';
import { useTheme } from '@/theme';

/** Sign up — phone with OTP, or Apple / Google / email (same button style for all three). */
export default function Register() {
  const params = useLocalSearchParams<{ social?: 'apple' | 'google'; signin?: string }>();
  const { c } = useTheme();
  const { pendingRole } = useSession();
  const finish = useFinishAuth();
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });
  const [country, setCountry] = useState(popularCountries[0]);
  const [phone, setPhone] = useState('');
  const [connecting, setConnecting] = useState<'apple' | 'google' | null>(params.social ?? null);
  const ok = phone.length >= 9;

  // Prototype: the provider window "returns" after 1.6 s.
  useEffect(() => {
    if (!connecting) return;
    const t = setTimeout(() => {
      const p = connecting;
      setConnecting(null);
      if (params.signin) finishRef.current({ email: 'mia.colsen@gmail.com' });
      else router.replace(pendingRole === 'employer' ? '/employer/type' : { pathname: '/auth/about', params: { social: p } });
    }, 1600);
    return () => clearTimeout(t);
  }, [connecting, params.signin, pendingRole]);

  return (
    <FormScreen
      title="What's your number?"
      subtitle="We'll text you a one-time code. Or sign up with Apple, Google or email."
      footer={
        <>
          <Text variant="caption" weight={400} color="textBody" align="center">
            By continuing you agree to the{' '}
            <Text variant="caption" weight={700} color="link" style={{ textDecorationLine: 'underline' }}>
              Terms
            </Text>{' '}
            and{' '}
            <Text variant="caption" weight={700} color="link" style={{ textDecorationLine: 'underline' }}>
              Privacy Policy
            </Text>
          </Text>
          <Button size="l" label="Get code" disabled={!ok} onPress={() => router.push({ pathname: '/auth/code', params: { flow: 'signup', to: `${country.dial}|${phone}` } })} />
        </>
      }>
      <PhoneInput country={country} onCountry={setCountry} value={phone} onChange={setPhone} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon name="lock" size={14} color="textBody" />
        <Text variant="bodyS" color="textBody">
          Employers never see your number until you apply
        </Text>
      </View>
      <OrDivider label="or" />
      <View style={{ gap: 12 }}>
        <Button variant="secondary" label="Continue with Apple" leading={<BrandMarkPlaceholder />} onPress={() => setConnecting('apple')} />
        <Button variant="secondary" label="Continue with Google" leading={<BrandMarkPlaceholder />} onPress={() => setConnecting('google')} />
        <Button variant="secondary" label="Continue with email" icon="mail" onPress={() => router.push('/auth/register-email')} />
      </View>
      <Pressable onPress={() => router.replace('/auth/sign-in')} accessibilityRole="link" style={{ alignSelf: 'center', paddingVertical: 8 }}>
        <Text variant="body" color="textBody" style={{ fontSize: 14 }}>
          Already have an account?{' '}
          <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
            Sign in
          </Text>
        </Text>
      </Pressable>

      <Modal visible={!!connecting} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: c.scrim, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <View accessibilityRole="alert" style={{ backgroundColor: c.surface, borderRadius: 24, padding: 24, alignItems: 'center', gap: 10, width: 280 }}>
            <ActivityIndicator color={c.primary} size="large" />
            <Text variant="bodyL" weight={700} align="center">
              Connecting to {connecting === 'apple' ? 'Apple' : 'Google'}…
            </Text>
            <Text variant="bodyS" color="textBody" align="center">
              Finish signing in in the window that opened
            </Text>
            <Pressable onPress={() => setConnecting(null)} accessibilityRole="button" style={{ paddingVertical: 8 }}>
              <Text variant="body" weight={700} color="link">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </FormScreen>
  );
}
