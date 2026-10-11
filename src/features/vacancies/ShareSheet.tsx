import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { Linking, Share, View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Text, useToast, type IconName } from '@/components';
import { contractTypes, formatAmount } from '@/data/dictionaries';
import type { Vacancy } from '@/data/types';
import { useTheme, type Colors } from '@/theme';

export const vacancyLink = (v: Vacancy) =>
  `919.app/v/${v.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 28)}`;

/** Share vacancy (ShareSheet): preview with the short link, Messages / Mail / Copy link / More, Copy link CTA. */
export function ShareSheet({ v, visible, onClose }: { v: Vacancy; visible: boolean; onClose: () => void }) {
  const { c } = useTheme();
  const toast = useToast();
  const link = vacancyLink(v);
  const text = `${v.title} · ${v.company.name}, ${v.pay.currency} ${formatAmount(v.pay.amount)} ${contractTypes[v.pay.contract].suffix} — https://${link}`;

  const copy = async () => {
    onClose();
    await Clipboard.setStringAsync(`https://${link}`);
    toast({ text: 'Link copied', icon: 'link', aboveTabBar: true });
  };
  const open = (url: string) => {
    onClose();
    Linking.openURL(url).catch(() => toast({ text: 'No app to share with', kind: 'neutral', icon: 'alert-circle' }));
  };
  const targets: { label: string; icon: IconName; bg: keyof Colors; fg: keyof Colors; onPress: () => void }[] = [
    { label: 'Messages', icon: 'message', bg: 'successBack', fg: 'successText', onPress: () => open(`sms:?&body=${encodeURIComponent(text)}`) },
    { label: 'Mail', icon: 'mail', bg: 'primarySecondary', fg: 'primary', onPress: () => open(`mailto:?subject=${encodeURIComponent(v.title)}&body=${encodeURIComponent(text)}`) },
    { label: 'Copy link', icon: 'link', bg: 'input', fg: 'textHeadline', onPress: copy },
    { label: 'More', icon: 'more', bg: 'input', fg: 'textHeadline', onPress: () => (onClose(), Share.share({ message: text })) },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text variant="title" accessibilityRole="header" style={{ fontSize: 20, lineHeight: 26 }}>
        Share vacancy
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 18, backgroundColor: c.input }}>
        <Image source={v.cover} contentFit="cover" style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: c.backDarker }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15 }}>
            {v.title}
          </Text>
          <Text variant="bodyS" color="textBody" style={{ marginTop: 2, fontSize: 13 }} numberOfLines={1}>
            {v.pay.currency} {formatAmount(v.pay.amount)} {contractTypes[v.pay.contract].suffix} · {v.city}
          </Text>
          <Text variant="caption" weight={600} color="link" style={{ marginTop: 2 }} numberOfLines={1}>
            {link}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {targets.map((t) => (
          <Pressable key={t.label} onPress={t.onPress} accessibilityRole="button" style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: c[t.bg], alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={t.icon} size={24} color={t.fg} />
            </View>
            <Text variant="caption" weight={600} color="textPrimary">
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Button size="l" icon="link" label="Copy link" onPress={copy} />
    </BottomSheet>
  );
}
