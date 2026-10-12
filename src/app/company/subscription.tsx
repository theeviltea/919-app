import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Text, useToast, type IconName } from '@/components';
import { useEmployer } from '@/data/employer';
import { DangerTonal, Panel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

const PERKS: [IconName, string, string][] = [
  ['briefcase', 'Multiple job postings', 'Publish as many vacancies as you need at once'],
  ['message', 'Direct messages to applicants', 'Contact any candidate from their profile, video or search'],
  ['sparkles', 'More hiring opportunities', 'Premium badge on your company and vacancies'],
];

function Perks() {
  const { c } = useTheme();
  return (
    <View style={{ gap: 16 }}>
      {PERKS.map(([icon, t, d]) => (
        <View key={t} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.labelOrangeBack, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={18} color="labelOrangeText" />
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

function Line({ label, value, last }: { label: string; value: React.ReactNode; last?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: last ? 0 : 1, borderColor: c.divider }}>
      <Text variant="body" color="textBody" style={{ fontSize: 15 }}>
        {label}
      </Text>
      {typeof value === 'string' ? (
        <Text variant="body" weight={700} style={{ fontSize: 15 }}>
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  );
}

function Status({ label, ok }: { label: string; ok: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: ok ? c.successBack : c.input, justifyContent: 'center' }}>
      <Text variant="caption" weight={700} color={ok ? 'successText' : 'textBody'}>
        {label}
      </Text>
    </View>
  );
}

/** Black full-width CTA (Subscribe / Renew) as in EmpSubscription*. */
function InverseButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ height: 56, borderRadius: 18, backgroundColor: c.inverse, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="bodyL" weight={700} color="onInverse" style={{ fontSize: 16 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Fineprint() {
  return (
    <Text variant="caption" weight={400} color="textLightSecondary" align="center" style={{ fontSize: 11, lineHeight: 16, paddingHorizontal: 16 }}>
      Payment is charged to your Apple ID.{' '}
      <Text variant="caption" weight={400} color="textLightSecondary" style={{ fontSize: 11, textDecorationLine: 'underline' }}>
        Terms
      </Text>{' '}
      ·{' '}
      <Text variant="caption" weight={400} color="textLightSecondary" style={{ fontSize: 11, textDecorationLine: 'underline' }}>
        Privacy
      </Text>{' '}
      · Restore purchase
    </Text>
  );
}

/** Employer — Subscription (EmpSubscriptionFree / Active / Cancel / Canceled). */
export default function EmployerSubscription() {
  const { c } = useTheme();
  const toast = useToast();
  const { plan, setPlan } = useEmployer();
  const [cancel, setCancel] = useState(false);

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
  const premiumPill = (
    <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.labelOrangeBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name="star" size={12} color="labelOrangeText" />
      <Text variant="caption" weight={700} color="labelOrangeText">
        Premium
      </Text>
    </View>
  );

  return (
    <SubScreen title="Subscription">
      {plan === 'free' ? (
        <>
          {head('Subscription', 'neutral', <Status label="Free" ok={false} />, 'You don’t have an active subscription yet. Get Premium to publish more vacancies and message candidates directly.')}
          <Panel title="What’s included" gap={16}>
            <Perks />
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
          </Panel>
          <InverseButton label="Subscribe for $3.99 / month" onPress={() => (setPlan('premium'), toast({ text: 'Premium is active. Welcome!', kind: 'paid', icon: 'star' }))} />
          <Fineprint />
        </>
      ) : plan === 'premium' ? (
        <>
          {head('Subscription active', 'premium', premiumPill, 'You can publish more vacancies and send direct messages to candidates.')}
          <Panel title="Subscription status" gap={0}>
            <View style={{ marginTop: 4 }}>
              <Line label="Plan" value="Monthly subscription" />
              <Line label="Price" value="$3.99 / month" />
              <Line label="Status" value={<Status label="Active" ok />} />
              <Line label="Next payment" value="9 Nov 2026" />
              <Line label="Payment" value="Apple Pay" last />
            </View>
          </Panel>
          <Panel title="What’s included" gap={16}>
            <Perks />
          </Panel>
          <DangerTonal label="Cancel subscription" onPress={() => setCancel(true)} />
          <Text variant="bodyS" color="textBody" align="center" style={{ fontSize: 13, lineHeight: 19, paddingHorizontal: 12, paddingBottom: 16 }}>
            If you cancel, you keep Premium until the end of the paid period — 9 Nov 2026.
          </Text>
        </>
      ) : (
        <>
          {head('Subscription canceled', 'neutral', <Status label="Canceled" ok={false} />, 'Premium features stay available until 9 Nov 2026. Renew any time to keep them without a break.')}
          <Panel title="Subscription status" gap={0}>
            <View style={{ marginTop: 4 }}>
              <Line label="Plan" value="Monthly subscription" />
              <Line label="Price" value="$3.99 / month" />
              <Line label="Status" value={<Status label="Canceled" ok={false} />} />
              <Line label="Valid until" value="9 Nov 2026" last />
            </View>
          </Panel>
          <InverseButton label="Renew subscription" onPress={() => (setPlan('premium'), toast({ text: 'Subscription renewed', kind: 'paid', icon: 'star' }))} />
          <Fineprint />
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
            You’ll keep access to all Premium features until the end of the paid period — 9 Nov 2026. After that you’ll be on the Free plan: 1 active vacancy, chats only via applications.
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
          <Button size="l" variant="neutral" label="Keep Premium" onPress={() => setCancel(false)} />
        </View>
      </BottomSheet>
    </SubScreen>
  );
}
