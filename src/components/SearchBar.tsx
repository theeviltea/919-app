import { TextInput, View } from 'react-native';

import { fontFamily, useTheme } from '@/theme';

import { Icon } from './Icon';
import { Pressable } from './Pressable';

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  /** Yellow 44×44 filter button next to the bar (blue headers). */
  onFilterPress?: () => void;
  /** `header` — white on brand blue; `page` — white with stroke on back; `sheet` — `input` fill. */
  variant?: 'header' | 'page' | 'sheet';
  onSubmit?: () => void;
  autoFocus?: boolean;
};

/** SearchBar — 44px, magnifier left, clear button when filled. */
export function SearchBar({ value, onChangeText, placeholder = 'Search', onFilterPress, variant = 'header', onSubmit, autoFocus }: Props) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <View
        style={{
          flex: 1,
          minWidth: 0,
          height: 44,
          borderRadius: 14,
          paddingLeft: 14,
          paddingRight: value ? 6 : 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: variant === 'sheet' ? c.input : c.surface,
          borderWidth: variant === 'page' ? 1 : 0,
          borderColor: c.stroke,
        }}>
        <Icon name="search" size={20} color="textBody" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.textLightSecondary}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          autoFocus={autoFocus}
          selectionColor={c.primary}
          accessibilityLabel={placeholder}
          style={[
            { flex: 1, padding: 0, fontFamily: fontFamily('sans', value ? 600 : 400), fontSize: 15, color: c.textHeadline },
            { outlineStyle: 'none' } as object,
          ]}
        />
        {value ? (
          <Pressable
            onPress={() => onChangeText('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="cancel" size={16} color="textBody" />
          </Pressable>
        ) : null}
      </View>
      {onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel="Filters"
          style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="filter" size={20} color="onUrgent" />
        </Pressable>
      ) : null}
    </View>
  );
}
