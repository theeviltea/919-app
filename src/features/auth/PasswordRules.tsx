import { View } from 'react-native';

import { Icon, Text } from '@/components';
import { useTheme } from '@/theme';

export const passwordRules = (p: string, repeat?: string) => {
  const r = [
    { label: 'At least 8 characters', ok: p.length >= 8 },
    { label: 'One number', ok: /\d/.test(p) },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(p) },
  ];
  if (repeat !== undefined) r.push({ label: 'Passwords match', ok: !!p && p === repeat });
  return r;
};

export function PasswordRules({ rules }: { rules: { label: string; ok: boolean }[] }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 14, gap: 8 }}>
      {rules.map((r) => (
        <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} accessibilityLabel={`${r.label}: ${r.ok ? 'done' : 'not yet'}`}>
          <Icon name={r.ok ? 'verified' : 'alert-circle'} size={16} color={r.ok ? 'successText' : 'textLightSecondary'} />
          <Text variant="body" color={r.ok ? 'textHeadline' : 'textBody'} style={{ fontSize: 14 }}>
            {r.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
