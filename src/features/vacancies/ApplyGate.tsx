import { View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Text, type IconName } from '@/components';
import type { GateItem } from '@/data/seeker';
import { useTheme } from '@/theme';

const icons: Record<GateItem['key'], IconName> = { photo: 'user', photos: 'image', about: 'edit', field: 'briefcase' };

/** Incomplete profile (§10): photo, 3+ photos, About and the vacancy's field are needed to apply. */
export function ApplyGate({ items, percent, visible, onClose, onFix }: { items: GateItem[]; percent: number; visible: boolean; onClose: () => void; onFix: (k: GateItem['key']) => void }) {
  const { c } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Complete your profile to apply" subtitle="Employers decide by your profile. Add these and your application goes through in one tap." closable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: c.backDarker }}>
          <View style={{ width: `${percent}%`, height: 6, borderRadius: 3, backgroundColor: c.urgent }} />
        </View>
        <Text variant="bodyS" weight={700}>
          Profile {percent}%
        </Text>
      </View>
      <View>
        {items.map((it, i) => (
          <View key={it.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderColor: c.divider }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.attentionBack, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icons[it.key]} size={18} color="attentionText" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight={700}>
                {it.title}
              </Text>
              <Text variant="bodyS" color="textBody">
                {it.text}
              </Text>
            </View>
            <Pressable onPress={() => onFix(it.key)} accessibilityRole="button" accessibilityLabel={`Add ${it.title}`} style={{ height: 34, paddingHorizontal: 12, borderRadius: 10, backgroundColor: c.primarySecondary, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text variant="bodyS" weight={700} color="link">
                Add
              </Text>
              <Icon name="chevron-right" size={14} color="link" />
            </Pressable>
          </View>
        ))}
      </View>
      <Button label="Complete profile" onPress={() => items[0] && onFix(items[0].key)} />
      <Pressable onPress={onClose} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: 6 }}>
        <Text variant="body" weight={700} color="link">
          Not now
        </Text>
      </Pressable>
    </BottomSheet>
  );
}
