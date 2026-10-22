import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Row, Text, TierBadge, useToast } from '@/components';
import { FREE_APPLY_LIMIT, useSeeker } from '@/data/seeker';
import { MAX_PERKS, PlanChip, PlanPerks, PLAN_NAME, PLAN_PRICE, PREMIUM_PERKS } from '@/features/profile/seekerPlan';
import { Fineprint, InverseButton, Line, Status } from '@/features/profile/subscriptionUi';
import { DangerTonal, Panel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

/** Seeker — Subscription (SeekSubscriptionFree / Active / Cancel / Canceled): the employer's pattern with Premium and Max. */
export default function SeekerSubscription() {
  const { c } = useTheme();
  const toast = useToast();
  const { plan, planCanceled, subscribe, cancelPlan, renewPlan, appsUsed } = useSeeker();
  const [cancel, setCancel] = useState(false);
  const paid = plan !== 'free';
  const perks = plan === 'premium' ? PREMIUM_PERKS : MAX_PERKS;

  const head = (title: string, active: boolean, chip: React.ReactNode, text: string, extra?: React.ReactNode) => (
    <Panel gap={12}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: active ? c.primarySecondary : c.input, alignItems: 'center', justifyContent: 'center' }}>
          {active && paid ? <TierBadge tier={plan} size={26} /> : <Icon name={paid ? 'star' : 'lock'} size={22} color="textBody" />}
        </View>
        <Text variant="bodyL" weight={700} style={{ flex: 1, fontSize: 17 }}>
          {title}
        </Text>
        {chip}
      </View>
      <Text variant="body" color="textBody" style={{ fontSize: 14, lineHeight: 21 }}>
        {text}
      </Text>
      {extra}
    </Panel>
  );

  return (
    <SubScreen title="Subscription">
      {!paid ? (
        <>
          {head(
            'No subscription',
            false,
            <Status label="Free" ok={false} />,
            `You’re on the Free plan: ${FREE_APPLY_LIMIT} applications a month, 10 photos and 1 video.`,
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                  Applications this month
                </Text>
                <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
                  {Math.min(appsUsed, FREE_APPLY_LIMIT)} of {FREE_APPLY_LIMIT}
                </Text>
              </View>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: c.input, overflow: 'hidden' }}>
                <View style={{ width: `${Math.min(100, (appsUsed / FREE_APPLY_LIMIT) * 100)}%`, height: '100%', borderRadius: 3, backgroundColor: c.primary }} />
              </View>
            </View>,
          )}
          {(['premium', 'max'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => router.push('/profile/plans')}
              accessibilityRole="button"
              style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
                <TierBadge tier={t} size={20} />
              </View>
              <View style={{ flex: 1, minWidth: 0, paddingVertical: 10 }}>
                <Text variant="bodyL" weight={600}>
                  {PLAN_NAME[t]}
                </Text>
                <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                  {t === 'premium' ? 'Unlimited applications, 20 photos, 5 videos' : 'Everything in Premium, top of search, frame, header'}
                </Text>
              </View>
              <Text variant="body" weight={700} style={{ fontSize: 14 }}>
                {PLAN_PRICE[t]}
              </Text>
              <Icon name="chevron-right" size={18} color="textLightSecondary" />
            </Pressable>
          ))}
          <Panel title="Only with Max" gap={16}>
            <PlanPerks perks={MAX_PERKS.slice(0, 3)} />
          </Panel>
          <InverseButton label="Get Max for $5.99 / month" onPress={() => (subscribe('max'), toast({ text: 'Max is active. You’re at the top for employers', kind: 'paid', icon: 'star' }))} />
          <Pressable onPress={() => router.push('/profile/plans')} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: 6 }}>
            <Text variant="body" weight={700} color="link">
              Compare plans
            </Text>
          </Pressable>
          <Fineprint />
        </>
      ) : !planCanceled ? (
        <>
          {head('Subscription active', true, <PlanChip tier={plan} />, plan === 'max' ? 'You’re at the top for employers, with your frame, header and unlimited applications.' : 'You can apply without limits and show 20 photos and 5 videos.')}
          <Panel title="Subscription status" gap={0}>
            <View style={{ marginTop: 4 }}>
              <Line label="Plan" value={`${PLAN_NAME[plan]} · monthly`} />
              <Line label="Price" value={`${PLAN_PRICE[plan]} / month`} />
              <Line label="Status" value={<Status label="Active" ok />} />
              <Line label="Next payment" value="9 Nov 2026" />
              <Line label="Payment" value="Apple Pay" last />
            </View>
          </Panel>
          <Panel title="What’s included" gap={16}>
            <PlanPerks perks={perks} tier={plan} />
          </Panel>
          <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 4 }}>
            {plan === 'max' ? <Row icon="sparkles" title="Profile look" subtitle="Frame and header for your profile" onPress={() => router.push('/profile/look')} /> : null}
            <Row
              icon="star"
              title="Change plan"
              subtitle={plan === 'max' ? 'Switch to Premium for $2.99 / month' : 'Upgrade to Max for $5.99 / month'}
              onPress={() => router.push('/profile/plans')}
              last
            />
          </View>
          <DangerTonal label="Cancel subscription" onPress={() => setCancel(true)} />
          <Text variant="bodyS" color="textBody" align="center" style={{ fontSize: 13, lineHeight: 19, paddingHorizontal: 12, paddingBottom: 16 }}>
            If you cancel, you keep {PLAN_NAME[plan]} until the end of the paid period — 9 Nov 2026.
          </Text>
        </>
      ) : (
        <>
          {head(
            'Subscription canceled',
            false,
            <Status label="Canceled" ok={false} />,
            `${PLAN_NAME[plan]} features stay available until 9 Nov 2026. Renew any time to keep ${plan === 'max' ? 'your top placement, frame and header' : 'unlimited applications'}.`,
          )}
          <Panel title="Subscription status" gap={0}>
            <View style={{ marginTop: 4 }}>
              <Line label="Plan" value={`${PLAN_NAME[plan]} · monthly`} />
              <Line label="Price" value={`${PLAN_PRICE[plan]} / month`} />
              <Line label="Status" value={<Status label="Canceled" ok={false} />} />
              <Line label="Valid until" value="9 Nov 2026" last />
            </View>
          </Panel>
          <InverseButton label="Renew subscription" onPress={() => (renewPlan(), toast({ text: 'Subscription renewed', kind: 'paid', icon: 'star' }))} />
          <Fineprint />
        </>
      )}

      <BottomSheet visible={cancel} onClose={() => setCancel(false)}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
            <TierBadge tier={plan === 'free' ? 'max' : plan} size={34} />
          </View>
          <Text variant="title" align="center" style={{ marginTop: 6 }}>
            Cancel subscription?
          </Text>
          <Text variant="body" color="textBody" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
            You’ll keep {PLAN_NAME[plan]} until the end of the paid period — 9 Nov 2026. After that you’ll be on the Free plan:{' '}
            {plan === 'max' ? 'no top placement, frame or header, ' : ''}
            {FREE_APPLY_LIMIT} applications a month.
          </Text>
        </View>
        <View style={{ gap: 12, marginTop: 8 }}>
          <Button
            size="l"
            variant="destructive"
            label="Cancel subscription"
            onPress={() => {
              setCancel(false);
              cancelPlan();
              toast({ text: `Subscription canceled. ${PLAN_NAME[plan]} stays until 9 Nov 2026`, icon: 'check' });
            }}
          />
          <Button size="l" variant="neutral" label={`Keep ${PLAN_NAME[plan]}`} onPress={() => setCancel(false)} />
        </View>
      </BottomSheet>
    </SubScreen>
  );
}
