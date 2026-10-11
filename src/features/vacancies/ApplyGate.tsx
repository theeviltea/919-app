import { View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Text, type IconName } from '@/components';
import type { GateItem } from '@/data/seeker';
import { useTheme } from '@/theme';

const icons: Record<GateItem['key'], IconName> = { photo: 'user', photos: 'image', about: 'file', field: 'briefcase' };

/** Incomplete profile (§10): photo, 3+ photos, About and the vacancy's field are needed to apply. */
export function ApplyGate({ items, percent, visible, onClose, onFix }: { items: GateItem[]; percent: number; visible: boolean; onClose: () => void; onFix: (k: GateItem['key']) => void }) {
  const { c } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Complete your profile to apply" subtitle="Employers decide by your profile. Add these and your application goes through in one tap." closable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1, height: 8, borderRadius: 999, backgroundColor: c.input, overflow: 'hidden' }}>
          <View style={{ width: `${percent}%`, height: 8, borderRadius: 999, backgroundColor: c.urgent }} />
        </View>
        <Text variant="bodyS" weight={600} color="textBody" style={{ fontSize: 13 }}>
          Profile{' '}
          <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
            {percent}%
          </Text>
        </Text>
      </View>
      <View style={{ borderTopWidth: 1, borderColor: c.divider }}>
        {items.map((it) => (
          <Pressable key={it.key} onPress={() => onFix(it.key)} accessibilityRole="button" accessibilityLabel={`Add ${it.title}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.attentionBack, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icons[it.key]} size={20} color="attentionText" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="body" weight={600} style={{ fontSize: 15 }}>
                {it.title}
              </Text>
              <Text variant="bodyS" color="textBody" style={{ marginTop: 2, fontSize: 13 }}>
                {it.text}
              </Text>
            </View>
            <View style={{ height: 32, paddingLeft: 12, paddingRight: 10, borderRadius: 999, backgroundColor: c.primarySecondary, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text variant="bodyS" weight={700} color="link" style={{ fontSize: 13 }}>
                Add
              </Text>
              <Icon name="chevron-right" size={14} color="link" />
            </View>
          </Pressable>
        ))}
      </View>
      <Button size="l" label="Complete profile" onPress={() => items[0] && onFix(items[0].key)} />
      <Pressable onPress={onClose} accessibilityRole="button" style={{ marginTop: -6, height: 40, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="body" weight={600} color="link" style={{ fontSize: 15 }}>
          Not now
        </Text>
      </Pressable>
    </BottomSheet>
  );
}
