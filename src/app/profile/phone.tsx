import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, FormScreen, Icon, Text } from '@/components';
import { popularCountries } from '@/data/dictionaries';
import { useSeeker } from '@/data/seeker';
import { PhoneInput } from '@/features/auth/PhoneInput';
import { useTheme } from '@/theme';

// Prototype: numbers starting with 52 444 belong to another 919 account.
const TAKEN = /^52444/;

/** Change or add the sign-in phone. Get code → /auth/code?flow=phone, which saves it and returns to Personal info. */
export default function PhoneScreen() {
  const { mode = 'change' } = useLocalSearchParams<{ mode?: 'change' | 'add' }>();
  const { c } = useTheme();
  const { profile } = useSeeker();
  const [country, setCountry] = useState(popularCountries[0]);
  const [digits, setDigits] = useState('');
  const change = mode === 'change' && !!profile.phone;
  const full = `${country.dial} ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  const error = TAKEN.test(digits)
    ? 'This number is linked to another 919 account. Sign in with it, or delete that account first.'
    : digits.length === 9 && full === profile.phone
      ? 'This is your current number.'
      : undefined;
  const ok = digits.length >= 9 && !error;

  return (
    <FormScreen
      title={change ? 'Change phone number' : 'Add phone number'}
      subtitle={change ? 'Enter your new number. We’ll text a code to confirm it.' : 'We’ll text you a code to confirm it’s yours. You’ll also be able to sign in with this number.'}
      footer={<Button size="l" label="Get code" disabled={!ok} onPress={() => router.push({ pathname: '/auth/code', params: { flow: 'phone', to: `${country.dial}|${digits}`, mode: change ? 'change' : 'add' } })} />}>
      {change ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, backgroundColor: c.surface }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="phone" size={20} color="textBody" />
          </View>
          <View>
            <Text variant="caption" color="textBody">
              Current number
            </Text>
            <Text variant="bodyL" weight={600}>
              {profile.phone}
            </Text>
          </View>
        </View>
      ) : null}
      <View style={{ gap: 8, marginTop: change ? 8 : 0 }}>
        <PhoneInput label={change ? 'New phone number' : 'Phone number'} country={country} onCountry={setCountry} value={digits} onChange={setDigits} autoFocus error={error} />
        {!error ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="lock" size={14} color="textBody" />
            <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
              {change ? 'The old number will stop working for sign-in' : 'Employers never see your number until you apply'}
            </Text>
          </View>
        ) : null}
      </View>
    </FormScreen>
  );
}
