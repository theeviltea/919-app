import { router } from 'expo-router';
import { useState } from 'react';

import { BottomSheet, BrandMarkPlaceholder, Button, FormScreen, Icon, Pressable, Text } from '@/components';
import { popularCountries } from '@/data/dictionaries';
import { PhoneInput } from '@/features/auth/PhoneInput';
import { View } from 'react-native';

/** Sign in — phone first; email / Apple / Google behind "Another way to sign in". */
export default function SignIn() {
  const [country, setCountry] = useState(popularCountries[0]);
  const [phone, setPhone] = useState('');
  const [other, setOther] = useState(false);
  const ok = phone.length >= 9;
  return (
    <FormScreen
      title="Welcome back"
      subtitle="Enter the phone number linked to your 919 account. We'll text you a one-time code."
      headerAction={{ label: 'Create account', onPress: () => router.replace('/auth/register') }}
      footer={<Button size="l" label="Get code" disabled={!ok} onPress={() => router.push({ pathname: '/auth/code', params: { flow: 'signin', to: `${country.dial}|${phone}` } })} />}>
      <PhoneInput country={country} onCountry={setCountry} value={phone} onChange={setPhone} autoFocus />
      <Pressable onPress={() => setOther(true)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 8 }}>
        <Icon name="mail" size={18} color="link" />
        <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
          Another way to sign in
        </Text>
      </Pressable>
      <BottomSheet visible={other} onClose={() => setOther(false)} title="Other ways to sign in" subtitle="Use the method you chose when you created the account." closable>
        <View style={{ gap: 12 }}>
          <Button label="Sign in with email" icon="mail" onPress={() => (setOther(false), router.push('/auth/email'))} />
          <Button variant="secondary" label="Continue with Apple" leading={<BrandMarkPlaceholder />} onPress={() => (setOther(false), router.push({ pathname: '/auth/register', params: { social: 'apple', signin: '1' } }))} />
          <Button variant="secondary" label="Continue with Google" leading={<BrandMarkPlaceholder />} onPress={() => (setOther(false), router.push({ pathname: '/auth/register', params: { social: 'google', signin: '1' } }))} />
        </View>
      </BottomSheet>
    </FormScreen>
  );
}
