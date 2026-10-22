import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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
  /** Custom leading element, e.g. the Apple / Google mark (BrandMark). */
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

/** Official Apple and Google marks for the sign-in buttons: Apple in the text colour, Google in its own colours. */
export function BrandMark({ brand, size = 20 }: { brand: 'apple' | 'google'; size?: number }) {
  const { c } = useTheme();
  if (brand === 'google') return <Image source={GOOGLE} accessibilityLabel="Google" style={{ width: size, height: size }} contentFit="contain" />;
  return (
    <View accessibilityLabel="Apple" style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={APPLE} fill={c.textHeadline} />
      </Svg>
    </View>
  );
}

const GOOGLE = require('@/assets/images/brand/google.png');
const APPLE =
  'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701';
