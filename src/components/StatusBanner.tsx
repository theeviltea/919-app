import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme, type Colors } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Kind = 'attention' | 'danger' | 'info' | 'success';

const kinds: Record<Kind, { back: keyof Colors; tile: keyof Colors; tileFg: keyof Colors; sub: keyof Colors; icon: IconName }> = {
  attention: { back: 'attentionBack', tile: 'urgent', tileFg: 'onUrgent', sub: 'attentionText', icon: 'edit' },
  danger: { back: 'dangerBack', tile: 'dangerText', tileFg: 'ctaButtonText', sub: 'dangerText', icon: 'alert-circle' },
  info: { back: 'infoBack', tile: 'surface', tileFg: 'infoText', sub: 'infoText', icon: 'alert-circle' },
  success: { back: 'successBack', tile: 'successText', tileFg: 'ctaButtonText', sub: 'successText', icon: 'check' },
};

/** StatusBanner — large status block under a header: changes needed, rejected, info, success. */
export function StatusBanner({ kind, title, subtitle, icon, children }: { kind: Kind; title: string; subtitle?: string; icon?: IconName; children?: ReactNode }) {
  const { c } = useTheme();
  const k = kinds[kind];
  return (
    <View style={{ backgroundColor: c[k.back], borderRadius: 24, padding: 18, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c[k.tile], alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon ?? k.icon} size={22} color={k.tileFg} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="bodyL" weight={700}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodyS" color={k.sub} style={{ marginTop: 2 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {children}
    </View>
  );
}

/** Numbered moderator remark inside an attention banner. */
export function BannerItem({ n, text }: { n: number; text: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderColor: c.divider }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="caption" weight={700} color="onUrgent">
          {n}
        </Text>
      </View>
      <Text variant="body" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
        {text}
      </Text>
    </View>
  );
}
