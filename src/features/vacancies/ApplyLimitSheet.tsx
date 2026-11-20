import { router } from 'expo-router';
import { View } from 'react-native';

import { BottomSheet, Icon, Pressable, Text, TierBadge, useToast, type IconName } from '@/components';
import { applyLimitOf, useSeeker } from '@/data/seeker';
import { PLAN_NAME, PLAN_PRICE } from '@/features/profile/seekerPlan';
import { InverseButton } from '@/features/profile/subscriptionUi';
import { useTheme } from '@/theme';

const PERKS: Record<'premium' | 'max', [IconName | 'badge', string][]> = {
  premium: [
    ['check-double', '15 applications a month'],
    ['arrow-right', 'Priority in search'],
    ['badge', 'Blue star badge on your profile'],
  ],
  max: [
    ['check-double', 'Unlimited applications'],
    ['arrow-right', 'Highest priority in search'],
    ['badge', 'Gold star badge and profile style'],
  ],
};

/** SeekApplyLimit: the monthly limit is used up (Free 5, Premium 15) — offers the next plan. Applications already sent stay active. */
export function ApplyLimitSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { c } = useTheme();
  const toast = useToast();
  const { subscribe, plan } = useSeeker();
  const limit = applyLimitOf(plan);
  const next = plan === 'free' ? 'premium' : 'max';
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="lock" size={28} color="primary" />
        </View>
        <Text variant="title" align="center" style={{ marginTop: 6 }}>
          You’ve used all {limit} applications this month
        </Text>
        <Text variant="body" color="textBody" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
          Get {PLAN_NAME[next]} to keep applying. The applications you already sent stay active.
        </Text>
      </View>
      <View style={{ padding: 14, borderRadius: 16, backgroundColor: c.input, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
            Applications on {PLAN_NAME[plan]}
          </Text>
          <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
            {limit} / {limit}
          </Text>
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: c.error }} />
      </View>
      <View style={{ gap: 10 }}>
        {PERKS[next].map(([icon, t]) => (
          <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
              {icon === 'badge' ? <TierBadge tier={next} size={18} /> : <Icon name={icon} size={16} color="link" />}
            </View>
            <Text variant="body" style={{ fontSize: 14 }}>
              {t}
            </Text>
          </View>
        ))}
      </View>
      <InverseButton
        label={`Get ${PLAN_NAME[next]} · ${PLAN_PRICE[next]} / month`}
        onPress={() => {
          subscribe(next);
          onClose();
          toast({ text: next === 'max' ? 'Max is active. Apply as much as you like' : 'Premium is active. 15 applications a month', kind: 'paid', icon: 'star' });
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
        <Pressable
          onPress={() => {
            onClose();
            router.push('/profile/plans');
          }}
          accessibilityRole="button"
          style={{ paddingVertical: 8 }}>
          <Text variant="body" weight={700} color="link">
            Compare plans
          </Text>
        </Pressable>
        <Pressable onPress={onClose} accessibilityRole="button" style={{ paddingVertical: 8 }}>
          <Text variant="body" weight={700} color="textBody">
            Not now
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
