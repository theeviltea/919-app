import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BottomSheet, Icon, Pressable, SearchBar, Text } from '@/components';
import { useTheme } from '@/theme';

type Section = { title?: string; items: string[] };

type Props = {
  visible: boolean;
  title: string;
  /** Flat options or titled sections (e.g. POPULAR / ALL COUNTRIES). */
  options?: string[];
  sections?: Section[];
  value?: string;
  searchPlaceholder?: string;
  /** Small code chip in front of each item, e.g. country ISO code. */
  badge?: (item: string) => string | undefined;
  /** Muted text before the radio, e.g. a result count. */
  meta?: (item: string) => string | undefined;
  onClose: () => void;
  onSelect: (v: string) => void;
};

/** Single choice in a sheet — radio on the right, optional search and sections (country, city, sizes). */
export function SelectSheet({ visible, title, options, sections, value, searchPlaceholder, badge, meta, onClose, onSelect }: Props) {
  const { c } = useTheme();
  const [q, setQ] = useState('');
  const groups = useMemo<Section[]>(() => {
    const base = sections ?? [{ items: options ?? [] }];
    if (!q.trim()) return base;
    const s = q.trim().toLowerCase();
    const all = Array.from(new Set(base.flatMap((g) => g.items))).filter((i) => i.toLowerCase().includes(s));
    return [{ title: 'RESULTS', items: all }];
  }, [sections, options, q]);

  return (
    <BottomSheet visible={visible} onClose={() => (setQ(''), onClose())} title={title} closable>
      {searchPlaceholder ? <SearchBar variant="sheet" value={q} onChangeText={setQ} placeholder={searchPlaceholder} /> : null}
      <ScrollView style={{ maxHeight: 460 }} keyboardShouldPersistTaps="handled">
        {groups.map((g, gi) => (
          <View key={gi} style={{ marginTop: gi ? 12 : 0 }}>
            {g.title ? (
              <Text variant="caption" weight={700} color="textBody" style={{ letterSpacing: 0.6, marginBottom: 4 }}>
                {g.title}
              </Text>
            ) : null}
            {g.items.length === 0 ? (
              <Text variant="body" color="textBody" style={{ paddingVertical: 16 }}>
                Nothing found
              </Text>
            ) : null}
            {g.items.map((o, i) => {
              const on = o === value;
              const b = badge?.(o);
              return (
                <Pressable
                  key={o}
                  onPress={() => (setQ(''), onSelect(o))}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, borderBottomWidth: i === g.items.length - 1 ? 0 : 1, borderColor: c.divider }}>
                  {b ? (
                    <View style={{ width: 32, height: 22, borderRadius: 6, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                      <Text variant="caption" weight={700} color="textBody" style={{ fontSize: 10 }}>
                        {b}
                      </Text>
                    </View>
                  ) : null}
                  <Text variant="bodyL" weight={on ? 700 : 500} style={{ flex: 1 }}>
                    {o}
                  </Text>
                  {meta?.(o) ? (
                    <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                      {meta(o)}
                    </Text>
                  ) : null}
                  {on ? (
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="check" size={14} color="ctaButtonText" />
                    </View>
                  ) : (
                    <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: c.control }} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </BottomSheet>
  );
}
