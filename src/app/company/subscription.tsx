import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Text, useToast } from '@/components';
import { EMP_PLANS, planName, tierOfPlan, useEmployer, type PaidPlan } from '@/data/employer';
import { Fineprint, InverseButton, Line, Status } from '@/features/profile/subscriptionUi';
import { DangerTonal, Panel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

const FREE_PERKS: [string, string][] = [
  ['1 active vacancy', 'Post one vacancy at a time'],
  ['Browse talent profiles', 'Chat with candidates who applied to your vacancy'],
];

function Perks({ perks }: { perks: [string, string][] }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 14 }}>
      {perks.map(([t, d]) => (
        <View key={t} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.labelOrangeBack, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={14} color="labelOrangeText" />
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

/** A paid plan to pick: name, price, note and perks; the picked one gets the orange outline. */
function PlanCard({ plan, on, onPress }: { plan: PaidPlan; on: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const p = EMP_PLANS[plan];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 14, borderWidth: 2, borderColor: on ? c.labelOrangeText : 'transparent' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text variant="bodyL" weight={700} style={{ flex: 1, fontSize: 17 }}>
          {p.name}
        </Text>
        {plan === 'premium' ? (
          <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.successBack, justifyContent: 'center' }}>
            <Text variant="caption" weight={700} color="successText">
              First month free
            </Text>
          </View>
        ) : null}
        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? c.labelOrangeText : c.control, alignItems: 'center', justifyContent: 'center' }}>
          {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.labelOrangeText }} /> : null}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <Text variant="displayM" style={{ fontSize: 26, lineHeight: 32 }}>
          {p.price}
        </Text>
        <Text variant="bodyS" weight={600} color="textBody" style={{ fontSize: 13 }}>
          / month
        </Text>
      </View>
      {plan === 'super' ? (
        <Text variant="caption" weight={400} color="textBody" style={{ marginTop: -8, fontSize: 12 }}>
          {p.note}
        </Text>
      ) : null}
      <Perks perks={p.perks} />
    </Pressable>
  );
}

/** Employer — Subscription (EmpSubscriptionFree / Active / Cancel / Canceled): Free, Premium and Super Premium. */
export default function EmployerSubscription() {
  const { c } = useTheme();
  const toast = useToast();
  const { plan, setPlan } = useEmployer();
  const [cancel, setCancel] = useState(false);
  const [pick, setPick] = useState<PaidPlan>('premium');
  const tier = tierOfPlan(plan);

  const subscribe = (p: PaidPlan) => {
    setPlan(p);
    toast({ text: p === 'premium' ? 'Premium is active. Your first month is free' : 'Super Premium is active. Welcome!', kind: 'paid', icon: 'star' });
  };

  const head = (title: string, tone: 'premium' | 'neutral', badge: React.ReactNode, text: string) => (
    <Panel gap={12}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: tone === 'premium' ? c.labelOrangeBack : c.input, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="star" size={22} color={tone === 'premium' ? 'labelOrangeText' : 'textBody'} />
        </View>
        <Text variant="bodyL" weight={700} style={{ flex: 1, fontSize: 17 }}>
          {title}
        </Text>
        {badge}
      </View>
      <Text variant="body" color="textBody" style={{ fontSize: 14, lineHeight: 21 }}>
        {text}
      </Text>
    </Panel>
  );
  const planPill = (
    <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.labelOrangeBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name="star" size={12} color="labelOrangeText" />
      <Text variant="caption" weight={700} color="labelOrangeText">
        {planName(plan)}
      </Text>
    </View>
  );

  return (
    <SubScreen title="Subscription">
      {plan === 'free' ? (
        <>
          {head('Subscription', 'neutral', <Status label="Free" ok={false} />, 'You’re on the Free plan. Pick a plan to post more vacancies and write to candidates first.')}
          <Panel title="Free plan" gap={14}>
            <Perks perks={FREE_PERKS} />
          </Panel>
          <View accessibilityRole="radiogroup" style={{ gap: 12 }}>
            {(['premium', 'super'] as const).map((p) => (
              <PlanCard key={p} plan={p} on={pick === p} onPress={() => setPick(p)} />
            ))}
          </View>
          <InverseButton label={pick === 'premium' ? 'Start free month' : `Subscribe for ${EMP_PLANS.super.price} / month`} onPress={() => subscribe(pick)} />
          <Text variant="caption" weight={400} color="textBody" align="center" style={{ fontSize: 12 }}>
            {pick === 'premium' ? `Then ${EMP_PLANS.premium.price} a month · cancel any time` : `${EMP_PLANS.super.note} · cancel any time`}
          </Text>
          <Fineprint />
        </>
      ) : plan === 'canceled' ? (
        <>
          {head('Subscription canceled', 'neutral', <Status label="Canceled" ok={false} />, 'Premium features stay available until 9 Nov 2026. Renew any time to keep them without a break.')}
          <Panel title="Subscription status" gap={0}>
            <View style={{ marginTop: 4 }}>
              <Line label="Plan" value="Premium · monthly" />
              <Line label="Price" value={`${EMP_PLANS.premium.price} / month`} />
              <Line label="Status" value={<Status label="Canceled" ok={false} />} />
              <Line label="Valid until" value="9 Nov 2026" last />
            </View>
          </Panel>
          <InverseButton label="Renew subscription" onPress={() => (setPlan('premium'), toast({ text: 'Subscription renewed', kind: 'paid', icon: 'star' }))} />
          <Fineprint />
        </>
      ) : (
        <>
          {head(
            'Subscription active',
            'premium',
            planPill,
            tier === 'super' ? 'Unlimited vacancies and direct messages to any candidate.' : 'Up to 10 active vacancies and 10 chat requests to candidates a month.',
          )}
          <Panel title="Subscription status" gap={0}>
            <View style={{ marginTop: 4 }}>
              <Line label="Plan" value={`${planName(plan)} · monthly`} />
              <Line label="Price" value={`${EMP_PLANS[tier as PaidPlan].price} / month`} />
              <Line label="Status" value={<Status label={tier === 'premium' ? 'Free month' : 'Active'} ok />} />
              <Line label={tier === 'premium' ? 'First payment' : 'Next payment'} value="9 Nov 2026" />
              <Line label="Payment" value="Apple Pay" last />
            </View>
          </Panel>
          <Panel title="What’s included" gap={16}>
            <Perks perks={EMP_PLANS[tier as PaidPlan].perks} />
          </Panel>
          {tier === 'premium' ? (
            <Panel title="Need more?" gap={14}>
              <Text variant="body" color="textBody" style={{ fontSize: 14, lineHeight: 21 }}>
                Super Premium: unlimited vacancies and direct messages to any candidate. {EMP_PLANS.super.price} a month, {EMP_PLANS.super.note}.
              </Text>
              <Button label="Upgrade to Super Premium" variant="premium" onPress={() => subscribe('super')} />
            </Panel>
          ) : (
            <Panel list>
              <Pressable onPress={() => (setPlan('premium'), toast({ text: 'You’re on Premium now', icon: 'check' }))} accessibilityRole="button" style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text variant="body" weight={600} style={{ flex: 1, fontSize: 15 }}>
                  Switch to Premium · {EMP_PLANS.premium.price} / month
                </Text>
                <Icon name="chevron-right" size={18} color="textLightSecondary" />
              </Pressable>
            </Panel>
          )}
          <DangerTonal label="Cancel subscription" onPress={() => setCancel(true)} />
          <Text variant="bodyS" color="textBody" align="center" style={{ fontSize: 13, lineHeight: 19, paddingHorizontal: 12, paddingBottom: 16 }}>
            If you cancel, you keep {planName(plan)} until the end of the paid period — 9 Nov 2026.
          </Text>
        </>
      )}

      <BottomSheet visible={cancel} onClose={() => setCancel(false)}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.labelOrangeBack, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="star" size={30} color="labelOrangeText" />
          </View>
          <Text variant="title" align="center" style={{ marginTop: 6 }}>
            Cancel subscription?
          </Text>
          <Text variant="body" color="textBody" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
            You’ll keep {planName(plan)} until the end of the paid period — 9 Nov 2026. After that you’ll be on the Free plan: 1 active vacancy, chats only via applications.
          </Text>
        </View>
        <View style={{ gap: 12, marginTop: 8 }}>
          <Button
            size="l"
            variant="destructive"
            label="Cancel subscription"
            onPress={() => {
              setCancel(false);
              setPlan('canceled');
              toast({ text: 'Subscription canceled. Premium stays until 9 Nov 2026', icon: 'check' });
            }}
          />
          <Button size="l" variant="neutral" label={`Keep ${planName(plan)}`} onPress={() => setCancel(false)} />
        </View>
      </BottomSheet>
    </SubScreen>
  );
}
