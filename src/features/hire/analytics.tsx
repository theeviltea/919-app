// Employer analytics in the app: the small widget on Vacancies and the pieces of the Analytics screen.
// Analytics is a paid feature: on the Free plan the widget and the screen show what it gives and lead to the subscription.
import { router } from 'expo-router';
import { View } from 'react-native';

import { Icon, Pressable, Text } from '@/components';
import { useEmployer } from '@/data/employer';
import { statsOf, viewsSeries } from '@/data/vacancyStats';
import { InverseButton } from '@/features/profile/subscriptionUi';
import { useTheme } from '@/theme';

export const fmt = (n: number) => n.toLocaleString('en').replace(/,/g, ' ');
export const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

/** Analytics needs a subscription. A canceled one keeps it until the paid period ends. */
export function useAnalyticsAccess() {
  const { plan } = useEmployer();
  return plan !== 'free';
}

/** Views per day as bars; the last bar is today. */
export function Bars({ values, height = 120, muted }: { values: number[]; height?: number; muted?: boolean }) {
  const { c } = useTheme();
  const max = Math.max(1, ...values);
  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }} accessibilityRole="image" accessibilityLabel={`Views per day: ${values.join(', ')}`}>
      {values.map((v, i) => (
        <View
          key={i}
          style={{ flex: 1, height: `${Math.max(3, (v / max) * 100)}%`, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: !muted && i === values.length - 1 ? c.primary : c.primarySecondary }}
        />
      ))}
    </View>
  );
}

export function PremiumPill() {
  const { c } = useTheme();
  return (
    <View style={{ height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: c.labelOrangeBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name="star" size={12} color="labelOrangeText" />
      <Text variant="caption" weight={700} color="labelOrangeText" style={{ fontSize: 12 }}>
        Premium
      </Text>
    </View>
  );
}

/** Vacancies tab: a small card under My vacancies / Saved talent that opens the Analytics screen. */
export function AnalyticsWidget() {
  const { c } = useTheme();
  const { vacancies, applicants } = useEmployer();
  const open = useAnalyticsAccess();
  const live = vacancies.filter((v) => v.status === 'active');
  const views = live.reduce((a, v) => a + statsOf(v, 7, (applicants[v.id] ?? []).length).views, 0);
  const series = Array.from({ length: 7 }, (_, i) => live.reduce((a, v) => a + viewsSeries(v, 7)[i], 0));
  return (
    <Pressable
      onPress={() => router.push('/hire/analytics')}
      accessibilityRole="button"
      accessibilityLabel={open ? `Analytics: ${fmt(views)} views in 7 days` : 'Analytics, available with Premium'}
      style={{ backgroundColor: c.surface, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: open ? c.primarySecondary : c.labelOrangeBack, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={open ? 'view' : 'lock'} size={22} color={open ? 'primary' : 'labelOrangeText'} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="body" weight={700} style={{ fontSize: 16 }}>
            Analytics
          </Text>
          {open ? null : <PremiumPill />}
        </View>
        <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 2, fontSize: 13 }}>
          {open ? `${fmt(views)} views this week` : 'Views, who viewed, sources'}
        </Text>
      </View>
      {open ? (
        <View style={{ width: 64 }}>
          <Bars values={series} height={32} />
        </View>
      ) : null}
      <Icon name="chevron-right" size={20} color="textBody" />
    </Pressable>
  );
}

const PERKS: [string, string][] = [
  ['Views and applications per day', 'For each vacancy and for all of them, 7 or 14 days'],
  ['Who viewed and when', 'See who opened a vacancy but didn’t apply, and message them first'],
  ['Where views come from', 'Feed, search, Urgent, shared links and your company page'],
  ['How well candidates fit', 'A match score with your open vacancies'],
];

/** The Analytics screen on the Free plan: what the subscription gives, with a faded preview of the chart. */
export function AnalyticsLocked() {
  const { c } = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 20, gap: 16 }}>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ opacity: 0.55 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {['1 308', '929', '1.7%'].map((n, i) => (
              <View key={i} style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: c.input }}>
                <Text variant="displayM" color="textLightSecondary" style={{ fontSize: 18, lineHeight: 22 }}>
                  {n}
                </Text>
                <View style={{ marginTop: 6, height: 6, width: '70%', borderRadius: 3, backgroundColor: c.backDarker }} />
              </View>
            ))}
          </View>
          <Bars values={[42, 48, 45, 51, 70, 96, 64]} height={88} muted />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.labelOrangeBack, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="lock" size={22} color="labelOrangeText" />
          </View>
          <Text variant="bodyL" weight={700} style={{ flex: 1, fontSize: 18, lineHeight: 24 }}>
            Detailed analytics come with Premium
          </Text>
        </View>
        <Text variant="body" color="textBody" style={{ fontSize: 14, lineHeight: 21 }}>
          See how people find your vacancies, who looks at them and who is worth a message.
        </Text>
        <View style={{ gap: 14 }}>
          {PERKS.map(([t, d]) => (
            <View key={t} style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.successBack, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                <Icon name="check" size={14} color="successText" />
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
      </View>
      <InverseButton label="Get Premium" onPress={() => router.push('/company/subscription')} />
      <Text variant="caption" weight={400} color="textBody" style={{ textAlign: 'center', fontSize: 12 }}>
        From $3.99 a month · cancel any time
      </Text>
    </View>
  );
}
