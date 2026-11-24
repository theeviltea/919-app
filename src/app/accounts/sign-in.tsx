import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, BrandMark, Button, FormScreen, Icon, Pressable, Text } from '@/components';
import { phoneLength, popularCountries } from '@/data/dictionaries';
import { accountIdFor, useSession } from '@/data/session';
import { AccountAvatar } from '@/features/accounts/ui';
import { PhoneInput } from '@/features/auth/PhoneInput';
import { useTheme } from '@/theme';

/** Add account → sign in (AccAddSignIn). Signing in to an account that's already on the phone offers to switch to it (AccAlready). */
export default function AddAccountSignIn() {
  const { c } = useTheme();
  const { user, accounts, switchTo } = useSession();
  const [country, setCountry] = useState(popularCountries[0]);
  const [phone, setPhone] = useState('');
  const [other, setOther] = useState(false);
  const [already, setAlready] = useState<string | null>(null);
  const ok = phone.length >= phoneLength(country.dial);
  const existing = accounts.find((a) => a.id === already);
  const stays = user ? (user.role === 'seeker' ? user.name.split(' ')[0] : user.name) : '';

  const getCode = () => {
    // Prototype: a number of all 8s is the demo employer, any other one the demo seeker.
    const id = accountIdFor({ role: /^8+$/.test(phone) ? 'employer' : 'seeker' });
    if (accounts.some((a) => a.id === id)) return setAlready(id);
    router.push({ pathname: '/auth/code', params: { flow: 'signin', to: `${country.dial}|${phone}` } });
  };

  return (
    <FormScreen
      title="Add an account"
      subtitle="Sign in to your other 919 account. You can switch between accounts in Settings or from your profile."
      top={
        user ? (
          <View style={{ alignSelf: 'flex-end', height: 44, paddingLeft: 6, paddingRight: 12, borderRadius: 999, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AccountAvatar account={user} size={32} />
            <Text variant="bodyS" weight={600} color="textPrimary" numberOfLines={1} style={{ fontSize: 13, flexShrink: 1 }}>
              {stays} stays signed in
            </Text>
          </View>
        ) : null
      }
      footer={<Button size="l" label="Get code" disabled={!ok} onPress={getCode} />}>
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
          <Button variant="secondary" label="Continue with Apple" leading={<BrandMark brand="apple" />} onPress={() => (setOther(false), router.push({ pathname: '/auth/register', params: { social: 'apple', signin: '1' } }))} />
          <Button variant="secondary" label="Continue with Google" leading={<BrandMark brand="google" />} onPress={() => (setOther(false), router.push({ pathname: '/auth/register', params: { social: 'google', signin: '1' } }))} />
        </View>
      </BottomSheet>

      <BottomSheet visible={!!existing} onClose={() => setAlready(null)}>
        {existing ? (
          <>
            <View style={{ alignItems: 'center', gap: 6, paddingTop: 4 }}>
              <AccountAvatar account={existing} size={64} />
              <Text variant="displayM" align="center" accessibilityRole="header" style={{ marginTop: 6, fontSize: 20, lineHeight: 26 }}>
                This account is already added
              </Text>
              <Text variant="body" color="textBody" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
                {existing.name} is already on this phone. Switch to it instead.
              </Text>
            </View>
            <View style={{ gap: 12, marginTop: 8 }}>
              <Button
                size="l"
                label={existing.id === user?.id ? 'Stay in this account' : `Switch to ${existing.name}`}
                onPress={() => {
                  setAlready(null);
                  if (existing.id === user?.id) return router.back();
                  switchTo(existing.id);
                }}
              />
              <Button size="l" variant="neutral" label="Use another account" onPress={() => (setAlready(null), setPhone(''))} />
            </View>
          </>
        ) : null}
      </BottomSheet>
    </FormScreen>
  );
}
