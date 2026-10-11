import type { ReactNode } from 'react';
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type Colors } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'tonal' | 'neutral' | 'premium' | 'danger' | 'destructive';
export type ButtonSize = 'l' | 'm' | 's';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  /** Custom leading element, e.g. the dashed brand-mark placeholder on Apple / Google buttons. */
  leading?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const sizes = { l: { h: 56, r: 18, f: 16 }, m: { h: 52, r: 16, f: 16 }, s: { h: 44, r: 14, f: 15 } } as const;

type Look = { bg: string; fg: keyof Colors; border?: string; weight: 600 | 700 };

/** Button — L 56 (pinned footer), M 52 (content, sheets), S 44 (pairs inside cards). No coloured shadows. */
export function Button({ label, onPress, variant = 'primary', size = 'm', icon, leading, disabled, loading, style, accessibilityLabel }: Props) {
  const { c } = useTheme();
  const s = sizes[size];
  const looks: Record<ButtonVariant, Look> = {
    primary: { bg: c.primary, fg: 'ctaButtonText', weight: 700 },
    secondary: { bg: c.surface, fg: 'textHeadline', border: c.stroke, weight: 600 },
    tonal: { bg: c.primarySecondary, fg: 'link', weight: 700 },
    neutral: { bg: c.input, fg: 'textHeadline', weight: 600 },
    premium: { bg: c.labelOrangeBack, fg: 'labelOrangeText', weight: 700 },
    danger: { bg: c.surface, fg: 'dangerText', weight: 700 },
    // Solid red for the final step of irreversible actions (log out, delete account).
    destructive: { bg: '#E0123F', fg: 'ctaButtonText', weight: 700 },
  };
  const v = looks[variant];
  const off = !!disabled && variant === 'primary';
  const fg: keyof Colors = off ? 'textLightSecondary' : v.fg;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={[
        {
          height: s.h,
          borderRadius: s.r,
          backgroundColor: off ? c.backDarker : v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          paddingHorizontal: 16,
          opacity: disabled && !off ? 0.5 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={c[fg]} />
      ) : (
        <>
          {leading}
          {icon ? <Icon name={icon} size={20} color={fg} /> : null}
          <Text variant="bodyL" weight={v.weight} color={fg} style={{ fontSize: s.f }} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

/** Dashed 20×20 square standing in for the official Apple / Google marks until we get them. */
export function BrandMarkPlaceholder() {
  const { c } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.placeholderDashed }}
    />
  );
}
