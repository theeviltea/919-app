import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

/** Card — `surface` block on `back`, radius 20, no border. */
export function Card({ children, style, padding = 14, radius = 20 }: { children: ReactNode; style?: StyleProp<ViewStyle>; padding?: number; radius?: number }) {
  const { c } = useTheme();
  return <View style={[{ backgroundColor: c.surface, borderRadius: radius, padding }, style]}>{children}</View>;
}

/** Group of 64px rows with dividers — settings and editing. */
export function RowGroup({ title, children }: { title?: string; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {title ? (
        <Text variant="bodyS" weight={600} color="textBody" style={{ textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>
          {title}
        </Text>
      ) : null}
      <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 4 }}>{children}</View>
    </View>
  );
}

type RowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  danger?: boolean;
  /** Icon tile colour; `danger` implies red. */
  tone?: 'brand' | 'success' | 'premium' | 'neutral';
  right?: ReactNode;
  chevron?: boolean;
  last?: boolean;
  onPress?: () => void;
};

export function Row({ title, subtitle, icon, danger, tone = 'brand', right, chevron = !right, last, onPress }: RowProps) {
  const { c } = useTheme();
  const tile = danger
    ? { bg: c.dangerBack, fg: 'dangerText' }
    : { brand: { bg: c.primarySecondary, fg: 'primary' }, success: { bg: c.successBack, fg: 'labelGreenText' }, premium: { bg: c.labelOrangeBack, fg: 'labelOrangeText' }, neutral: { bg: c.input, fg: 'textBody' } }[tone];
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 10, borderBottomWidth: last ? 0 : 1, borderColor: c.divider }}>
      {icon ? (
        <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: tile.bg }}>
          <Icon name={icon} size={20} color={tile.fg} />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyL" weight={600} color={danger ? 'dangerText' : 'textHeadline'}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodyS" color="textBody" style={{ marginTop: 2, fontSize: 13, lineHeight: 18 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
      {chevron ? <Icon name="chevron-right" size={18} color="textLightSecondary" /> : null}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  ) : (
    content
  );
}
