import { View } from 'react-native';

import { Pressable, Text } from '@/components';
import { useTheme } from '@/theme';

// Shared parts of the subscription screens (EmpSubscription* and SeekSubscription*): one pattern for both roles.

export function Line({ label, value, last }: { label: string; value: React.ReactNode; last?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: last ? 0 : 1, borderColor: c.divider }}>
      <Text variant="body" color="textBody" style={{ fontSize: 15 }}>
        {label}
      </Text>
      {typeof value === 'string' ? (
        <Text variant="body" weight={700} style={{ fontSize: 15 }}>
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  );
}

export function Status({ label, ok }: { label: string; ok: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: ok ? c.successBack : c.input, justifyContent: 'center' }}>
      <Text variant="caption" weight={700} color={ok ? 'successText' : 'textBody'}>
        {label}
      </Text>
    </View>
  );
}

/** Black full-width CTA (Subscribe / Renew) as in EmpSubscription*. */
export function InverseButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ height: 56, borderRadius: 18, backgroundColor: c.inverse, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="bodyL" weight={700} color="onInverse" style={{ fontSize: 16 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Fineprint() {
  return (
    <Text variant="caption" weight={400} color="textLightSecondary" align="center" style={{ fontSize: 11, lineHeight: 16, paddingHorizontal: 16 }}>
      Payment is charged to your Apple ID.{' '}
      <Text variant="caption" weight={400} color="textLightSecondary" style={{ fontSize: 11, textDecorationLine: 'underline' }}>
        Terms
      </Text>{' '}
      ·{' '}
      <Text variant="caption" weight={400} color="textLightSecondary" style={{ fontSize: 11, textDecorationLine: 'underline' }}>
        Privacy
      </Text>{' '}
      · Restore purchase
    </Text>
  );
}

