import { useState } from 'react';

import { Field, Icon, Pressable } from '@/components';

export function PasswordField({ label, value, onChangeText, error, autoFocus, isNew }: { label: string; value: string; onChangeText: (v: string) => void; error?: string; autoFocus?: boolean; isNew?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <Field
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder="Password"
      secureTextEntry={!show}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete={isNew ? 'new-password' : 'current-password'}
      textContentType={isNew ? 'newPassword' : 'password'}
      autoFocus={autoFocus}
      error={error}
      right={
        <Pressable onPress={() => setShow(!show)} accessibilityRole="button" accessibilityLabel={show ? 'Hide password' : 'Show password'} hitSlop={8}>
          <Icon name={show ? 'eye-off' : 'view'} size={20} color="textBody" />
        </Pressable>
      }
    />
  );
}
