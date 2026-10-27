import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

type Item<K extends string> = { key: K; label: string; count?: number; icon?: IconName; /** Brand colour for the icon (the yellow flash of Today). */ iconColor?: string };

/** SegmentedTabs — 2–4 views inside one screen. Track `back-darker`, active segment `surface`. */
export function SegmentedTabs<K extends string>({ items, value, onChange }: { items: Item<K>[]; value: K; onChange: (k: K) => void }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: 16, backgroundColor: c.backDarker }}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <Pressable
            key={it.key}
            onPress={() => onChange(it.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: it.icon ? (items.length > 2 ? 6 : 8) : 4,
              backgroundColor: on ? c.surface : 'transparent',
              boxShadow: on ? '0 2px 8px rgba(14,26,43,0.08)' : undefined,
            }}>
            {it.icon ? <Icon name={it.icon} size={18} color={it.iconColor ?? (on ? 'textHeadline' : 'textPrimary')} /> : null}
            <Text variant="body" weight={on ? 700 : 600} color={on ? 'textHeadline' : 'textPrimary'} style={{ fontSize: 14 }} numberOfLines={1}>
              {it.label}
            </Text>
            {it.count != null ? (
              <Text variant="body" weight={600} color="textBody" style={{ fontSize: 14 }}>
                {it.count}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
