import { View } from 'react-native';

import { Skeleton } from '@/components';
import { useTheme } from '@/theme';

/** VacancyCardSkeleton: vacancy page while it loads — photo block, summary card, fit card and details. Chrome and Respond stay real. */
export function VacancyCoverSkeleton() {
  return <Skeleton height={300} radius={0} strong />;
}

export function VacancyBodySkeleton() {
  const { c } = useTheme();
  const card = { backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 14 } as const;
  return (
    <View style={{ marginTop: -36, paddingHorizontal: 16, gap: 12 }} accessibilityLabel="Loading vacancy" accessibilityRole="progressbar">
      <View style={card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Skeleton width={32} height={32} radius={10} strong />
          <Skeleton width={100} height={10} radius={5} />
          <View style={{ flex: 1 }} />
          <Skeleton width={82} height={26} radius={13} strong />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Skeleton width={80} height={28} radius={14} strong />
          <Skeleton width={100} height={8} radius={4} />
        </View>
        <Skeleton width="86%" height={16} radius={8} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Skeleton width={130} height={16} radius={8} />
          <Skeleton width={50} height={8} radius={4} />
          <View style={{ flex: 1 }} />
          <Skeleton width={66} height={26} radius={13} strong />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 12, borderTopWidth: 1, borderColor: c.divider }}>
          <View style={{ flex: 1, paddingLeft: 20 }}>
            <Skeleton width={70} height={8} radius={4} />
          </View>
          <Skeleton width={44} height={8} radius={4} />
          <Skeleton width={34} height={8} radius={4} />
        </View>
      </View>
      <Skeleton height={142} radius={24} strong />
      <View style={card}>
        <Skeleton width={120} height={12} radius={6} />
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Skeleton width={i % 2 ? 70 : 90} height={8} radius={4} />
            <Skeleton width={i % 2 ? 150 : 110} height={10} radius={5} />
          </View>
        ))}
      </View>
    </View>
  );
}
