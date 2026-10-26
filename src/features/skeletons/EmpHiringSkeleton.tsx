import { View } from 'react-native';

import { Skeleton } from '@/components';
import { useTheme } from '@/theme';

function VacancyCardSkeleton({ urgent }: { urgent?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Skeleton width={52} height={52} radius={14} strong />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="62%" height={12} radius={6} />
          <Skeleton width="78%" height={9} radius={5} />
        </View>
        <Skeleton width={36} height={36} radius={12} strong />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Skeleton width={56} height={26} radius={13} strong />
        {urgent ? <Skeleton width={80} height={26} radius={13} strong /> : null}
        <View style={{ flex: 1 }}>
          <Skeleton width="80%" height={8} radius={4} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {Array.from({ length: 7 }, (_, i) => (
          <View key={i} style={{ flex: 1 }}>
            <Skeleton height={4} radius={2} strong />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12, borderTopWidth: 1, borderColor: c.divider }}>
        <View style={{ flexDirection: 'row' }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ marginLeft: i ? -8 : 0, borderRadius: 17, borderWidth: 2, borderColor: c.surface }}>
              <Skeleton width={30} height={30} radius={15} strong />
            </View>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Skeleton width="55%" height={9} radius={5} />
        </View>
        <Skeleton width={50} height={26} radius={13} strong />
      </View>
    </View>
  );
}

/** EmpHiringSkeleton: stats card, filter chips and vacancy cards of the Vacancies hub. */
export function EmpHiringSkeleton() {
  const { c } = useTheme();
  return (
    <View style={{ gap: 12 }} accessibilityLabel="Loading vacancies" accessibilityState={{ busy: true }}>
      <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flex: 1, flexDirection: 'row', gap: 12 }}>
            {i ? <View style={{ width: 1, backgroundColor: c.divider }} /> : null}
            <View style={{ flex: 1, gap: 8, paddingVertical: 4 }}>
              <Skeleton width={18} height={18} radius={6} />
              <Skeleton width="70%" height={8} radius={4} />
              <Skeleton width="55%" height={8} radius={4} />
            </View>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, overflow: 'hidden' }}>
        <Skeleton width={56} height={36} radius={18} strong />
        {[78, 88, 82].map((w, i) => (
          <View key={i} style={{ width: w, height: 36, borderRadius: 18, borderWidth: 1, borderColor: c.stroke, backgroundColor: c.surface, justifyContent: 'center', paddingHorizontal: 14 }}>
            <Skeleton height={8} radius={4} />
          </View>
        ))}
      </View>
      <VacancyCardSkeleton urgent />
      <VacancyCardSkeleton />
      <VacancyCardSkeleton />
    </View>
  );
}
