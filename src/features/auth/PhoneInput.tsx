import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';

import { BottomSheet, Icon, Pressable, SearchBar, Text } from '@/components';
import { formatPhone, phoneLength, phoneMask, popularCountries } from '@/data/dictionaries';
import type { Country } from '@/data/types';
import { fontFamily, useTheme } from '@/theme';

/** Regional-indicator emoji flag from an ISO code. */
export const flag = (code: string) => String.fromCodePoint(...[...code.toUpperCase()].map((ch) => 0x1f1a5 + ch.charCodeAt(0)));

export { formatPhone };
export const maskPhone = (dial: string, digits: string) => `${dial} ${digits.slice(0, 2)} ••• ${digits.slice(-4)}`;

type Props = { country: Country; onCountry: (c: Country) => void; value: string; onChange: (digits: string) => void; autoFocus?: boolean; label?: string; error?: string };

/** Country code button + phone field, as on SignInPhone / RegPhone. */
export function PhoneInput({ country, onCountry, value, onChange, autoFocus, label = 'Phone number', error }: Props) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  const [sheet, setSheet] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <Text variant="bodyS" weight={600}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={() => setSheet(true)}
          accessibilityRole="button"
          accessibilityLabel={`Country code ${country.dial}, ${country.name}`}
          style={{ height: 56, paddingHorizontal: 12, borderRadius: 16, backgroundColor: c.surface, borderWidth: 1, borderColor: c.stroke, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 18 }}>{flag(country.code)}</Text>
          <Text variant="bodyL">{country.dial}</Text>
          <Icon name="chevron-down" size={16} color="textBody" />
        </Pressable>
        <View
          style={{
            flex: 1,
            height: 56,
            borderRadius: 16,
            backgroundColor: error ? c.dangerBack : c.surface,
            borderWidth: focused || error ? 2 : 1,
            borderColor: error ? c.error : focused ? c.primary : c.stroke,
            paddingLeft: focused || error ? 15 : 16,
            paddingRight: 8,
            flexDirection: 'row',
            alignItems: 'center',
            boxShadow: focused && !error ? `0 0 0 4px ${c.focusRing}` : undefined,
          }}>
          <TextInput
            value={formatPhone(value, country.dial)}
            onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, phoneLength(country.dial)))}
            placeholder={phoneMask(country.dial).sample}
            placeholderTextColor={c.textLightSecondary}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            autoFocus={autoFocus}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            selectionColor={c.primary}
            accessibilityLabel="Phone number"
            style={[{ flex: 1, fontFamily: fontFamily('sans', 600), fontSize: 16, color: c.textHeadline, padding: 0 }, { outlineStyle: 'none' } as object]}
          />
          {value ? (
            <Pressable onPress={() => onChange('')} accessibilityLabel="Clear" hitSlop={8} style={{ padding: 6 }}>
              <Icon name="cancel" size={18} color="textBody" />
            </Pressable>
          ) : null}
        </View>
      </View>
      {error ? (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <View style={{ marginTop: 2 }}>
            <Icon name="alert-circle" size={14} color="dangerText" />
          </View>
          <Text variant="bodyS" color="dangerText" style={{ flex: 1, fontSize: 13 }}>
            {error}
          </Text>
        </View>
      ) : null}
      <CountrySheet visible={sheet} selected={country} onClose={() => setSheet(false)} onSelect={(x) => (onCountry(x), onChange(value.slice(0, phoneLength(x.dial))), setSheet(false))} />
    </View>
  );
}

export function CountrySheet({ visible, selected, onClose, onSelect }: { visible: boolean; selected: Country; onClose: () => void; onSelect: (c: Country) => void }) {
  const { c } = useTheme();
  const [q, setQ] = useState('');
  const list = popularCountries.filter((x) => !q || `${x.name} ${x.dial}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Country code" closable>
      <SearchBar variant="sheet" value={q} onChangeText={setQ} placeholder="Search country or code" />
      <Text variant="caption" weight={700} color="textBody" style={{ letterSpacing: 0.6 }}>
        {q ? 'RESULTS' : 'POPULAR'}
      </Text>
      <ScrollView style={{ maxHeight: 420 }}>
        {list.map((x) => {
          const on = x.code === selected.code;
          return (
            <Pressable
              key={x.code + x.dial}
              onPress={() => onSelect(x)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 48, paddingHorizontal: 8, borderRadius: 12, backgroundColor: on ? c.primarySecondary : 'transparent' }}>
              <Text style={{ fontSize: 18 }}>{flag(x.code)}</Text>
              <Text variant="body" weight={on ? 700 : 500} style={{ flex: 1 }}>
                {x.name}
              </Text>
              <Text variant="body" color="textBody">
                {x.dial}
              </Text>
              {on ? <Icon name="check" size={18} color="primary" /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}
