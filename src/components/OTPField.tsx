import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { fontFamily, useTheme } from '@/theme';

import { Icon } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

type Props = {
  value: string;
  onChange: (v: string) => void;
  /** Called once all digits are entered — the code is submitted without a button. */
  onComplete?: (v: string) => void;
  length?: number;
  error?: string;
  autoFocus?: boolean;
};

/** OTPField — 6 cells, one real numeric input underneath. Paste and SMS autofill fill all cells. */
export function OTPField({ value, onChange, onComplete, length = 6, error, autoFocus = true }: Props) {
  const { c } = useTheme();
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const active = Math.min(value.length, length - 1);

  return (
    <View style={{ gap: 10 }}>
      <Pressable onPress={() => ref.current?.focus()} accessibilityLabel="SMS code" style={{ flexDirection: 'row', gap: 8 }}>
        {Array.from({ length }, (_, i) => {
          const isActive = focused && !error && i === active && value.length < length;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: 58,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: error ? c.dangerBack : c.surface,
                borderWidth: error || isActive ? 2 : 1,
                borderColor: error ? c.error : isActive ? c.primary : c.stroke,
                boxShadow: isActive ? `0 0 0 4px ${c.focusRing}` : undefined,
              }}>
              {value[i] ? (
                <Text variant="displayL" style={{ fontSize: 22, lineHeight: 28 }}>
                  {value[i]}
                </Text>
              ) : isActive ? (
                <View style={{ width: 2, height: 24, borderRadius: 2, backgroundColor: c.primary }} />
              ) : null}
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={ref}
        value={value}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChangeText={(t) => {
          const v = t.replace(/\D/g, '').slice(0, length);
          onChange(v);
          if (v.length === length) onComplete?.(v);
        }}
        keyboardType="number-pad"
        inputMode="numeric"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        caretHidden
        // 16px so iOS Safari doesn't zoom when the hidden input takes focus.
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, fontSize: 16, fontFamily: fontFamily('sans') }}
      />
      {error ? (
        <View accessibilityRole="alert" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="alert-circle" size={16} color="dangerText" />
          <Text variant="bodyS" weight={500} color="dangerText">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** "Resend code in 0:53" line under the OTP field. */
export function ResendTimer({ seconds, onResend }: { seconds: number; onResend: () => void }) {
  if (seconds <= 0) {
    return (
      <Pressable onPress={onResend} accessibilityRole="button" style={{ alignSelf: 'flex-start', paddingVertical: 6 }}>
        <Text variant="body" weight={700} color="link">
          Send a new code
        </Text>
      </Pressable>
    );
  }
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icon name="clock" size={16} color="textBody" />
      <Text variant="body" color="textBody" style={{ fontSize: 14 }}>
        Resend code in{' '}
        <Text variant="body" weight={700} style={{ fontSize: 14, fontVariant: ['tabular-nums'] }}>
          {m}:{s}
        </Text>
      </Text>
    </View>
  );
}
