import { View } from 'react-native';

import { Icon, Text } from '@/components';
import { useTheme } from '@/theme';

// Building blocks of a vacancy page, shared by the seeker view (vacancy/[id]) and the owner's view (my-vacancy/[id]).

export function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text variant="bodyL" weight={700} style={{ flex: 1 }} accessibilityRole="header">
          {title}
        </Text>
        {action}
      </View>
      {children}
    </View>
  );
}

export function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 11, borderBottomWidth: last ? 0 : 1, borderColor: c.divider }}>
      <Text variant="body" color="textBody">
        {label}
      </Text>
      <Text variant="body" weight={600} align="right" style={{ flexShrink: 1 }}>
        {value}
      </Text>
    </View>
  );
}

export function Meta({ icon, text, flex }: { icon: 'location' | 'clock' | 'view'; text: string; flex?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: flex ? 1 : undefined, minWidth: 0 }}>
      <Icon name={icon} size={16} color="textBody" />
      <Text variant="bodyS" color="textBody" numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}
