import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

type ChipProps = {
  label: string;
  selected?: boolean;
  count?: number;
  /** Selection chips in forms show a check when selected. */
  check?: boolean;
  icon?: IconName;
  onPress?: () => void;
};

/** Chip — clickable filter / selection. Selected = `inverse` fill. */
export function Chip({ label, selected, count, check, icon, onPress }: ChipProps) {
  const { c } = useTheme();
  const fg = selected ? 'onInverse' : 'textHeadline';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={{
        height: 36,
        paddingHorizontal: 14,
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: selected ? c.inverse : c.surface,
        borderWidth: selected ? 0 : 1,
        borderColor: c.stroke,
      }}>
      {selected && check ? <Icon name="check" size={14} color={fg} /> : icon ? <Icon name={icon} size={14} color={fg} /> : null}
      <Text variant="bodyS" weight={600} color={fg}>
        {label}
      </Text>
      {count != null ? (
        <Text variant="bodyS" weight={600} color={selected ? 'onInverse' : 'textBody'} style={selected ? { opacity: 0.7 } : undefined}>
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
}

export type StatusKind = 'success' | 'pending' | 'closed' | 'attention' | 'danger' | 'urgent' | 'premium' | 'new' | 'count';

const kinds = {
  success: { bg: 'successBack', fg: 'successText', icon: undefined },
  pending: { bg: 'input', fg: 'textBody', icon: 'clock' },
  closed: { bg: 'input', fg: 'textBody', icon: undefined },
  attention: { bg: 'attentionBack', fg: 'attentionText', icon: 'edit' },
  danger: { bg: 'dangerBack', fg: 'dangerText', icon: undefined },
  urgent: { bg: 'urgent', fg: 'onUrgent', icon: 'fire' },
  premium: { bg: 'labelOrangeBack', fg: 'labelOrangeText', icon: 'star' },
  new: { bg: 'primarySecondary', fg: 'link', icon: undefined },
  count: { bg: 'primary', fg: 'ctaButtonText', icon: undefined },
} as const;

/** StatusChip — non-interactive state label, 26px. */
export function StatusChip({ kind, label, icon }: { kind: StatusKind; label: string; icon?: IconName | null }) {
  const { c } = useTheme();
  const k = kinds[kind];
  const ic = icon === null ? undefined : (icon ?? k.icon);
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        height: 26,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: c[k.bg],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}>
      {ic ? <Icon name={ic} size={14} color={k.fg} /> : null}
      <Text variant="caption" weight={700} color={k.fg}>
        {label}
      </Text>
    </View>
  );
}
