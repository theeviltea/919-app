import { View } from 'react-native';

import { Skeleton } from '@/components';
import { useTheme } from '@/theme';

function ApplicantSkeleton({ note }: { note?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 52, height: 52 }}>
          <Skeleton width={52} height={52} radius={26} strong />
          <View style={{ position: 'absolute', right: -4, bottom: -4, borderRadius: 13, borderWidth: 2, borderColor: c.surface }}>
            <Skeleton width={22} height={22} radius={11} strong />
          </View>
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="40%" height={11} radius={6} />
          <Skeleton width="75%" height={9} radius={5} />
        </View>
        <Skeleton width={30} height={8} radius={4} />
      </View>
      {note ? (
        <View style={{ borderRadius: 16, backgroundColor: c.input, padding: 14, gap: 8 }}>
          <Skeleton width="90%" height={8} radius={4} />
          <Skeleton width="35%" height={8} radius={4} />
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Skeleton height={44} radius={14} />
        </View>
        <View style={{ flex: 1 }}>
          <Skeleton height={44} radius={14} strong />
        </View>
      </View>
    </View>
  );
}

/** EmpApplicantsSkeleton: sort line and applicant cards under the New / Accepted / Declined tabs. */
export function EmpApplicantsSkeleton() {
  return (
    <View style={{ gap: 12 }} accessibilityLabel="Loading applicants" accessibilityState={{ busy: true }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <Skeleton width={116} height={9} radius={5} />
        <Skeleton width={40} height={9} radius={5} />
      </View>
      <ApplicantSkeleton note />
      <ApplicantSkeleton />
      <ApplicantSkeleton note />
    </View>
  );
}
