import { router } from 'expo-router';
import { useState } from 'react';

import { Button, FormScreen, useToast } from '@/components';
import { PasswordField } from '@/features/auth/PasswordField';
import { PasswordRules, passwordRules } from '@/features/auth/PasswordRules';

/** Reset password — step 3: new password twice. */
export default function NewPassword() {
  const toast = useToast();
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const rules = passwordRules(p1, p2);
  return (
    <FormScreen
      title="Create a new password"
      subtitle="Use something you don't use on other sites."
      footer={
        <Button
          size="l"
          label="Save password"
          disabled={!rules.every((r) => r.ok)}
          onPress={() => {
            toast({ text: 'Password updated. Sign in with the new one', kind: 'neutral', icon: 'lock' });
            router.dismissTo('/auth/email');
          }}
        />
      }>
      <PasswordField label="New password" value={p1} onChangeText={setP1} isNew autoFocus />
      <PasswordField label="Repeat password" value={p2} onChangeText={setP2} isNew />
      <PasswordRules rules={rules} />
    </FormScreen>
  );
}
