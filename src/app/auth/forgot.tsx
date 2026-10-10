import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button, Field, FormScreen } from '@/components';

const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

/** Reset password — step 1: email. Prototype: nobody@919.ae has no account. */
export default function Forgot() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string>();
  return (
    <FormScreen
      title="Reset password"
      subtitle="Enter the email of your 919 account. We'll send a 6-digit code to reset your password."
      footer={
        <Button
          size="l"
          label="Send code"
          disabled={!isEmail(email)}
          onPress={() =>
            email.trim().toLowerCase() === 'nobody@919.ae'
              ? setError('There is no 919 account with this email')
              : router.push({ pathname: '/auth/code', params: { flow: 'forgot', to: email.trim() } })
          }
        />
      }>
      <Field label="Email" value={email} onChangeText={(v) => (setEmail(v), setError(undefined))} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" autoFocus error={error} />
    </FormScreen>
  );
}
