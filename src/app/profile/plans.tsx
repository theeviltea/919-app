import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useId, useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { FramedAvatar, Icon, Pressable, Text, TierBadge, useToast } from '@/components';
import { useSeeker } from '@/data/seeker';
import { PLAN_NAME, PLAN_PRICE } from '@/features/profile/seekerPlan';
import { Fineprint, InverseButton } from '@/features/profile/subscriptionUi';
import { SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

type Paid = 'premium' | 'max';

const BULLETS: Record<Paid, string[]> = {
  premium: ['Unlimited applications', 'Up to 20 photos and 5 videos', 'Blue star badge on your profile'],
  max: ['Everything in Premium', 'Always at the top for employers', 'Profile frame, 3 styles', 'Your own profile header'],
};

const COMPARE: [string, string, string, string][] = [
  ['Photos', '10', '20', '20'],
  ['Videos', '1', '5', '5'],
  ['Applications', '10', 'Unlimited', 'Unlimited'],
  ['Badge', '—', 'premium', 'max'],
  ['Top of search for employers', '—', '—', '✓'],
  ['Profile frame', '—', '—', '3 styles'],
  ['Custom profile header', '—', '—', '✓'],
];

/** Gradient outline of the selected plan card (Max colours). */
function SelectedOutline({ w, h }: { w: number; h: number }) {
  const id = `plan-sel-${useId().replace(/:/g, '')}`;
  return (
    <Svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFB800" />
          <Stop offset="0.35" stopColor="#FF1E54" />
          <Stop offset="0.7" stopColor="#7A3FD1" />
          <Stop offset="1" stopColor="#3589F2" />
        </LinearGradient>
      </Defs>
      <Rect x={1} y={1} width={w - 2} height={h - 2} rx={23} fill="none" stroke={`url(#${id})`} strokeWidth={2} />
    </Svg>
  );
}

function PlanCard({ t, on, onPress }: { t: Paid; on: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      style={{ borderRadius: 24, padding: 16, gap: 10, backgroundColor: c.surface, borderWidth: on ? 0 : 1.5, borderColor: c.stroke }}>
      {on && box ? <SelectedOutline w={box.w} h={box.h} /> : null}
      {t === 'max' ? (
        <View style={{ position: 'absolute', top: -11, right: 16, height: 22, paddingHorizontal: 9, borderRadius: 999, backgroundColor: c.inverse, justifyContent: 'center' }}>
          <Text variant="caption" weight={700} color="onInverse" style={{ fontSize: 11 }}>
            Best to get hired
          </Text>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {on ? (
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={14} color="ctaButtonText" />
          </View>
        ) : (
          <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: c.control }} />
        )}
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="bodyL" weight={700} style={{ fontSize: 18 }}>
            {PLAN_NAME[t]}
          </Text>
          <TierBadge tier={t} size={18} />
        </View>
        <Text variant="displayM" style={{ fontSize: 18 }}>
          {PLAN_PRICE[t]}
        </Text>
        <Text variant="caption" weight={400} color="textBody">
          / month
        </Text>
      </View>
      <View style={{ gap: 7, paddingLeft: 34 }}>
        {BULLETS[t].map((b) => (
          <View key={b} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="check" size={14} color="successText" />
            <Text variant="body" color="textPrimary" style={{ fontSize: 14 }}>
              {b}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

/** SeekPlans: Premium vs Max with a comparison table; the employer's black CTA and Apple ID note. */
export default function SeekerPlans() {
  const { c } = useTheme();
  const toast = useToast();
  const { profile, plan, planCanceled, subscribe } = useSeeker();
  const [pick, setPick] = useState<Paid>('max');
  const current = pick === plan && !planCanceled;
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'You';

  return (
    <SubScreen
      title="Subscription"
      footer={
        <View style={{ gap: 8 }}>
          <InverseButton
            label={current ? `You’re on ${PLAN_NAME[pick]}` : `Subscribe for ${PLAN_PRICE[pick]} / month`}
            onPress={() => {
              if (current) return;
              subscribe(pick);
              toast({ text: pick === 'max' ? 'Max is active. You’re at the top for employers' : 'Premium is active. Apply as much as you like', kind: 'paid', icon: 'star' });
              router.replace('/profile/subscription');
            }}
          />
          <Fineprint />
        </View>
      }>
      <View style={{ borderRadius: 26, backgroundColor: '#121A26', padding: 18, paddingVertical: 22, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <FramedAvatar frame="neon" size={76} ring={3} gap={3} bg="#121A26">
          {profile.photo ? <Image source={profile.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} /> : <View style={{ flex: 1, backgroundColor: c.avatar3 }} />}
        </FramedAvatar>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="bodyL" weight={700} color="#FFFFFF" numberOfLines={1} style={{ fontSize: 17, flexShrink: 1 }}>
              {name}
            </Text>
            <TierBadge tier="max" size={18} />
          </View>
          <Text variant="bodyS" color="rgba(255,255,255,0.75)" style={{ marginTop: 4, fontSize: 13, lineHeight: 19 }}>
            This is how employers will see you with Max: at the top, with your frame and gold badge.
          </Text>
        </View>
      </View>

      <PlanCard t="premium" on={pick === 'premium'} onPress={() => setPick('premium')} />
      <View style={{ height: 4 }} />
      <PlanCard t="max" on={pick === 'max'} onPress={() => setPick('max')} />

      <View style={{ backgroundColor: c.surface, borderRadius: 22, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 40 }}>
          <View style={{ flex: 1.5 }} />
          {['Free', 'Premium', 'Max'].map((h, i) => (
            <Text key={h} variant="caption" weight={700} color={i === 2 ? 'textHeadline' : 'textBody'} align="center" style={{ flex: i ? 1 : 0.8 }}>
              {h}
            </Text>
          ))}
        </View>
        {COMPARE.map(([k, a, b, m]) => (
          <View key={k} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44, borderTopWidth: 1, borderColor: c.divider }}>
            <Text variant="bodyS" color="textPrimary" style={{ flex: 1.5, fontSize: 13 }}>
              {k}
            </Text>
            <Text variant="bodyS" color="textBody" align="center" style={{ flex: 0.8, fontSize: 13 }}>
              {a}
            </Text>
            {[b, m].map((v, i) =>
              v === 'premium' || v === 'max' ? (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <TierBadge tier={v} size={18} />
                </View>
              ) : (
                <Text key={i} variant="bodyS" weight={i ? 700 : 600} align="center" style={{ flex: 1, fontSize: 13 }}>
                  {v}
                </Text>
              ),
            )}
          </View>
        ))}
      </View>
    </SubScreen>
  );
}
