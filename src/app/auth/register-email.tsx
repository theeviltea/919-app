import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Field, FormScreen, Text } from '@/components';
import { PasswordField } from '@/features/auth/PasswordField';
import { PasswordRules, passwordRules } from '@/features/auth/PasswordRules';

const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

/** Sign up with email — confirm with a 6-digit code. Prototype: taken@919.ae is an existing account. */
export default function RegisterEmail() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const rules = passwordRules(password);
  const taken = email.trim().toLowerCase() === 'taken@919.ae';
  const ok = isEmail(email) && rules.every((r) => r.ok) && !taken;
  return (
    <FormScreen
      title="Sign up with email"
      subtitle="We'll send a code to confirm it's your email."
      footer={
        <>
          <Text variant="caption" weight={400} color="textBody" align="center">
            By continuing you agree to the Terms and Privacy Policy
          </Text>
          <Button size="l" label="Continue" disabled={!ok} onPress={() => router.push({ pathname: '/auth/code', params: { flow: 'email', to: email.trim() } })} />
        </>
      }>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoFocus
        error={taken ? 'This email already has a 919 account. Sign in instead.' : undefined}
      />
      <PasswordField label="Create password" value={password} onChangeText={setPassword} isNew />
      <PasswordRules rules={rules} />
    </FormScreen>
  );
}
