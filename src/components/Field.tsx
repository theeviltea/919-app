import { useState, type ReactNode } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { fontFamily, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

type Props = Omit<TextInputProps, 'style' | 'editable'> & {
  label: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  /** Read-only value shown in the normal style (e.g. phone taken from sign-in). */
  locked?: boolean;
  /** true when the field sits inside a white card or sheet: `input` fill, no visible border. */
  onSurface?: boolean;
  rightIcon?: IconName;
  /** Makes the field a select / date trigger (not editable). */
  onPress?: () => void;
  counter?: boolean;
  right?: ReactNode;
};

/**
 * Field — the single input of 919: text, dropdown, date, textarea.
 * Label on top 12/500, value 16/600, min height 56, radius 16.
 */
export function Field({ label, required, error, disabled, locked, onSurface, rightIcon, onPress, counter, right, value, multiline, maxLength, ...input }: Props) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  const isSelect = !!onPress;
  const thick = !!error || focused;

  const bg = error ? c.dangerBack : disabled ? c.surfaceInset : focused ? c.surface : onSurface ? c.input : c.surface;
  const borderColor = error ? c.error : focused ? c.primary : disabled ? c.stroke : onSurface ? c.input : c.stroke;
  const labelColor = error ? 'dangerText' : focused ? 'link' : disabled ? 'textLightSecondary' : 'textBody';

  const body = (
    <View
      style={{
        minHeight: multiline ? 104 : 56,
        borderRadius: 16,
        backgroundColor: bg,
        borderWidth: thick ? 2 : 1,
        borderStyle: disabled ? 'dashed' : 'solid',
        borderColor,
        paddingVertical: thick ? 7 : 8,
        paddingLeft: thick ? 15 : 16,
        paddingRight: thick ? 13 : 14,
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        gap: 8,
        boxShadow: focused && !error ? `0 0 0 4px ${c.focusRing}` : undefined,
      }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="caption" color={labelColor}>
          {label}
          {required ? ' *' : ''}
        </Text>
        {isSelect ? (
          <Text
            variant="bodyL"
            weight={value ? 600 : 500}
            color={value && !disabled ? 'textHeadline' : 'textLightSecondary'}
            style={{ marginTop: 2 }}
            numberOfLines={1}>
            {value || input.placeholder || 'Select'}
          </Text>
        ) : (
          <TextInput
            {...input}
            value={value}
            multiline={multiline}
            maxLength={maxLength}
            editable={!disabled && !locked}
            onFocus={(e) => {
              setFocused(true);
              input.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              input.onBlur?.(e);
            }}
            placeholderTextColor={c.textLightSecondary}
            selectionColor={c.primary}
            style={[
              {
                marginTop: 2,
                padding: 0,
                fontFamily: fontFamily('sans', value ? 600 : 500),
                fontSize: 16,
                lineHeight: 22,
                color: disabled ? c.textLightSecondary : c.textHeadline,
                minHeight: multiline ? 66 : undefined,
                textAlignVertical: multiline ? 'top' : 'center',
              },
              // web: drop the browser focus outline, the field draws its own
              { outlineStyle: 'none' } as object,
            ]}
          />
        )}
        {counter && maxLength ? (
          <Text variant="caption" weight={400} color="textBody" align="right">
            {(value ?? '').length} / {maxLength}
          </Text>
        ) : null}
      </View>
      {right}
      {rightIcon ? <Icon name={rightIcon} size={18} color={disabled ? 'textLightSecondary' : 'textBody'} /> : null}
    </View>
  );

  return (
    <View style={{ gap: 6 }}>
      {isSelect ? (
        <Pressable
          onPress={onPress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`${label}${value ? `: ${value}` : ''}`}>
          {body}
        </Pressable>
      ) : (
        body
      )}
      {error ? (
        <View accessibilityRole="alert" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="alert-circle" size={14} color="dangerText" />
          <Text variant="caption" color="dangerText">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
