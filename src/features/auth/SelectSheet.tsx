import { ScrollView, View } from 'react-native';

import { BottomSheet, Pressable, Text } from '@/components';
import { useTheme } from '@/theme';

/** Single choice in a sheet with radio buttons (gender, country, city). */
export function SelectSheet({ visible, title, options, value, onClose, onSelect }: { visible: boolean; title: string; options: string[]; value?: string; onClose: () => void; onSelect: (v: string) => void }) {
  const { c } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} closable>
      <ScrollView style={{ maxHeight: 440 }}>
        {options.map((o, i) => {
          const on = o === value;
          return (
            <Pressable
              key={o}
              onPress={() => onSelect(o)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, borderBottomWidth: i === options.length - 1 ? 0 : 1, borderColor: c.divider }}>
              <Text variant="bodyL" weight={on ? 700 : 500} style={{ flex: 1 }}>
                {o}
              </Text>
              <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: on ? 7 : 2, borderColor: on ? c.primary : c.control }} />
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}
