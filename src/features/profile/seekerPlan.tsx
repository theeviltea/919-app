import { View } from 'react-native';

import { Icon, Text, TierBadge, type IconName } from '@/components';
import type { Tier } from '@/data/tiers';
import { useTheme } from '@/theme';

// Seeker plans (product rules §12): Premium $2.99 and Max $5.99 a month.
export const PLAN_PRICE: Record<Exclude<Tier, 'free'>, string> = { premium: '$2.99', max: '$5.99' };
export const PLAN_NAME: Record<Tier, string> = { free: 'Free', premium: 'Premium', max: 'Max' };

export const MAX_PERKS: [IconName | 'badge', string, string][] = [
  ['arrow-right', 'Always at the top for employers', 'First in Talents, search and recommendations'],
  ['sparkles', 'Profile frame', 'Choose one of 3 gradient frames'],
  ['image', 'Custom profile header', 'Your own cover photo at the top of the profile'],
  ['check-double', 'Unlimited applications', 'Apply to as many jobs as you want'],
  ['camera', '20 photos and 5 videos', 'Show more of your work in the profile'],
  ['badge', 'Gold star badge', 'On your photo and next to your name everywhere in 919'],
];
export const PREMIUM_PERKS: [IconName | 'badge', string, string][] = [
  ['check-double', 'Unlimited applications', 'Apply to as many jobs as you want'],
  ['camera', '20 photos and 5 videos', 'Show more of your work in the profile'],
  ['badge', 'Blue star badge', 'On your photo and next to your name everywhere in 919'],
];

/** Plan chip: the TierBadge and the plan name (Settings, Subscription, Profile look). */
export function PlanChip({ tier }: { tier: Tier }) {
  const { c } = useTheme();
  if (tier === 'free') {
    return (
      <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.input, justifyContent: 'center' }}>
        <Text variant="caption" weight={700} color="textBody">
          Free
        </Text>
      </View>
    );
  }
  return (
    <View style={{ height: 26, paddingLeft: 5, paddingRight: 10, borderRadius: 999, backgroundColor: c.primarySecondary, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <TierBadge tier={tier} size={18} />
      <Text variant="caption" weight={700}>
        {PLAN_NAME[tier]}
      </Text>
    </View>
  );
}

/** "What's included" list with 36px blue icon tiles (same pattern as the employer's perks). */
export function PlanPerks({ perks, tier = 'max' }: { perks: [IconName | 'badge', string, string][]; tier?: Exclude<Tier, 'free'> }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 16 }}>
      {perks.map(([icon, t, d]) => (
        <View key={t} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
            {icon === 'badge' ? <TierBadge tier={tier} size={20} /> : <Icon name={icon} size={18} color="link" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="body" weight={700} style={{ fontSize: 15 }}>
              {t}
            </Text>
            <Text variant="bodyS" color="textBody" style={{ marginTop: 2, fontSize: 13, lineHeight: 18 }}>
              {d}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
