import { View } from 'react-native';

import { BottomSheet, Icon, Pressable, Text } from '@/components';
import { useTheme } from '@/theme';

const PERKS = [
  ['Message any candidate directly', 'From their profile, video or search — without waiting for an application'],
  ['Unlimited active vacancies', 'Free plan includes 1 active vacancy at a time'],
] as const;

type Props = { visible: boolean; title: string; text: string; onSubscribe: () => void; onClose: () => void };

/** Employer Premium paywall (EmpPaywallContact / EmpPaywallVacancy): same perks and price, different headline. */
export function PremiumSheet({ visible, title, text, onSubscribe, onClose }: Props) {
  const { c } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.labelOrangeBack, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="star" size={30} color="labelOrangeText" />
        </View>
        <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.labelOrangeBack, justifyContent: 'center' }}>
          <Text variant="caption" weight={700} color="labelOrangeText">
            919 Premium
          </Text>
        </View>
        <Text variant="title" align="center">
          {title}
        </Text>
        <Text variant="body" color="textBody" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
          {text}
        </Text>
      </View>
      {PERKS.map(([t, d]) => (
        <View key={t} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.labelOrangeBack, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={14} color="labelOrangeText" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="body" weight={700} style={{ fontSize: 15 }}>
              {t}
            </Text>
            <Text variant="bodyS" color="textBody" style={{ fontSize: 13, lineHeight: 18 }}>
              {d}
            </Text>
          </View>
        </View>
      ))}
      <View style={{ padding: 14, borderRadius: 16, backgroundColor: c.input, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text variant="body" weight={700} style={{ fontSize: 15 }}>
            Monthly
          </Text>
          <Text variant="caption" weight={400} color="textBody" style={{ fontSize: 12 }}>
            Renews automatically · cancel any time
          </Text>
        </View>
        <Text variant="displayM" style={{ fontSize: 20 }}>
          $3.99
        </Text>
        <Text variant="bodyS" weight={600} color="textBody" style={{ fontSize: 13 }}>
          / month
        </Text>
      </View>
      <Pressable onPress={onSubscribe} accessibilityRole="button" style={{ height: 56, borderRadius: 18, backgroundColor: c.inverse, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="bodyL" weight={700} color="onInverse" style={{ fontSize: 16 }}>
          Subscribe with Apple Pay
        </Text>
      </Pressable>
      <Pressable onPress={onClose} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: 8 }}>
        <Text variant="body" weight={700} color="textBody">
          Not now
        </Text>
      </Pressable>
      <Text variant="caption" weight={400} color="textLightSecondary" align="center" style={{ fontSize: 11 }}>
        Payment is charged to your Apple ID. Terms · Privacy · Restore purchase
      </Text>
    </BottomSheet>
  );
}
