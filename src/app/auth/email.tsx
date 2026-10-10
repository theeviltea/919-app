import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Field, FormScreen, Icon, Pressable, Text } from '@/components';
import { PasswordField } from '@/features/auth/PasswordField';
import { useFinishAuth } from '@/features/auth/useFinishAuth';

const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

/** Sign in with email + password. Prototype: password "wrong" shows the error state. */
export default function EmailSignIn() {
  const finish = useFinishAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const ok = isEmail(email) && password.length > 0;
  return (
    <FormScreen
      title="Sign in with email"
      subtitle="Enter the email and password of your 919 account."
      headerAction={{ label: 'Create account', onPress: () => router.replace('/auth/register') }}
      footer={
        <Button
          size="l"
          label="Sign in"
          disabled={!ok}
          onPress={() => (password === 'wrong' ? setError('Wrong email or password') : finish({ email: email.trim() }))}
        />
      }>
      <Field label="Email" value={email} onChangeText={(v) => (setEmail(v), setError(undefined))} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" autoFocus />
      <PasswordField label="Password" value={password} onChangeText={(v) => (setPassword(v), setError(undefined))} error={error} />
      <Pressable onPress={() => router.push({ pathname: '/auth/forgot', params: { email } })} accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 8 }}>
        <Icon name="lock" size={18} color="link" />
        <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
          Forgot password?
        </Text>
      </Pressable>
    </FormScreen>
  );
}
