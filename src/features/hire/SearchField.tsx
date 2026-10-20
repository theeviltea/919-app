import { useState } from 'react';
import { Platform, TextInput, View, type TextStyle } from 'react-native';

import { Icon, Pressable, Text } from '@/components';
import { fontFamily, useTheme } from '@/theme';

/** Focused search field with clear and Cancel (EmpMessagesSearch). */
export function SearchField({ value, onChange, placeholder, onCancel }: { value: string; onChange: (v: string) => void; placeholder: string; onCancel: () => void }) {
  const { c } = useTheme();
  const [focus, setFocus] = useState(true);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        style={{
          flex: 1,
          height: 56,
          borderRadius: 18,
          borderWidth: 1.5,
          borderColor: focus ? c.primary : c.divider,
          backgroundColor: c.surface,
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 16,
          paddingRight: 8,
          gap: 10,
        }}>
        <Icon name="search" size={22} color="textBody" />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={c.textLightSecondary}
          autoFocus
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          returnKeyType="search"
          accessibilityLabel="Search"
          style={{ flex: 1, fontFamily: fontFamily('sans', 600), fontSize: 17, color: c.textHeadline, padding: 0, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) } as TextStyle}
        />
        {value ? (
          <Pressable
            onPress={() => onChange('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="cancel" size={16} color="textBody" />
          </Pressable>
        ) : null}
      </View>
      <Pressable onPress={onCancel} accessibilityRole="button" hitSlop={8}>
        <Text variant="body" weight={600} color="link" style={{ fontSize: 16 }}>
          Cancel
        </Text>
      </Pressable>
    </View>
  );
}

/** Text with the query highlighted (yellow marker), case-insensitive. */
export function Highlight({
  text,
  q,
  style,
  color,
  weight,
  numberOfLines,
}: {
  text: string;
  q: string;
  style?: TextStyle;
  color?: 'textBody' | 'textHeadline';
  weight?: 400 | 600 | 700;
  numberOfLines?: number;
}) {
  const { c } = useTheme();
  const needle = q.trim().toLowerCase();
  if (!needle) {
    return (
      <Text variant="bodyS" color={color} weight={weight} numberOfLines={numberOfLines} style={style}>
        {text}
      </Text>
    );
  }
  const parts: { t: string; hit: boolean }[] = [];
  const low = text.toLowerCase();
  let i = 0;
  while (i < text.length) {
    const j = low.indexOf(needle, i);
    if (j < 0) {
      parts.push({ t: text.slice(i), hit: false });
      break;
    }
    if (j > i) parts.push({ t: text.slice(i, j), hit: false });
    parts.push({ t: text.slice(j, j + needle.length), hit: true });
    i = j + needle.length;
  }
  return (
    <Text variant="bodyS" color={color} weight={weight} numberOfLines={numberOfLines} style={style}>
      {parts.map((p, k) =>
        p.hit ? (
          <Text key={k} variant="bodyS" weight={weight} color="textHeadline" style={[style, { backgroundColor: c.attentionBack }]}>
            {p.t}
          </Text>
        ) : (
          p.t
        ),
      )}
    </Text>
  );
}
