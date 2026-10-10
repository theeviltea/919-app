import { View } from 'react-native';

import { Icon, StatusChip, Text } from '@/components';
import { useTheme } from '@/theme';

/** Verification checklist: done steps with a green check, the current one grey "In progress". */
export function VerificationSteps({ steps }: { steps: { label: string; done: boolean }[] }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 20, paddingHorizontal: 14 }}>
      {steps.map((s, i) => (
        <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, borderTopWidth: i ? 1 : 0, borderColor: c.divider }}>
          <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: s.done ? c.successBack : c.input, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={s.done ? 'check' : 'clock'} size={14} color={s.done ? 'successText' : 'textBody'} />
          </View>
          <Text variant="body" weight={s.done ? 500 : 700} style={{ flex: 1, fontSize: 14 }}>
            {s.label}
          </Text>
          {!s.done ? <StatusChip kind="pending" label="In progress" icon={null} /> : null}
        </View>
      ))}
    </View>
  );
}
