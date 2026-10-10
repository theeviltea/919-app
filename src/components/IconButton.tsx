import { router } from 'expo-router';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';

type Tone = 'outline' | 'filled' | 'onBlue' | 'onPhoto';

/** Square icon button 44×44 (40 in sheets). `outline` = back button on `back`. */
export function IconButton({ icon, label, onPress, tone = 'outline', size = 44 }: { icon: IconName; label: string; onPress: () => void; tone?: Tone; size?: number }) {
  const { c } = useTheme();
  const look = {
    outline: { bg: c.surface, border: c.stroke, fg: 'textHeadline' },
    filled: { bg: c.input, border: undefined, fg: 'textHeadline' },
    onBlue: { bg: 'rgba(255,255,255,0.18)', border: undefined, fg: '#FFFFFF' },
    onPhoto: { bg: c.surfaceBlur, border: undefined, fg: 'textHeadline' },
  }[tone];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={{
        width: size,
        height: size,
        borderRadius: size >= 44 ? 14 : 12,
        backgroundColor: look.bg,
        borderWidth: look.border ? 1 : 0,
        borderColor: look.border,
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: tone === 'onPhoto' || tone === 'onBlue' ? 'blur(12px)' : undefined,
      } as object}>
      <Icon name={icon} size={22} color={look.fg} />
    </Pressable>
  );
}

export function BackButton({ tone, onPress }: { tone?: Tone; onPress?: () => void }) {
  return (
    <IconButton
      icon="arrow-left"
      label="Back"
      tone={tone}
      onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/guest')))}
    />
  );
}
