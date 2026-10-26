import { View } from 'react-native';

import { Skeleton } from '@/components';
import { useTheme } from '@/theme';

/** EmpSeekerProfileSkeleton: candidate profile while it loads — header card and the photo grid. Top actions and the CTA stay real. */
export function EmpSeekerProfileSkeleton() {
  const { c } = useTheme();
  return (
    <View style={{ gap: 12 }} accessibilityLabel="Loading profile" accessibilityRole="progressbar">
      <View style={{ backgroundColor: c.surface, borderRadius: 24, overflow: 'hidden' }}>
        <Skeleton height={88} radius={0} />
        <View style={{ paddingHorizontal: 18, paddingBottom: 18, alignItems: 'center', gap: 10 }}>
          <Skeleton width={104} height={104} radius={52} strong style={{ marginTop: -52, borderWidth: 4, borderColor: c.surface }} />
          <Skeleton width={132} height={12} radius={6} style={{ marginTop: 6 }} />
          <Skeleton width={112} height={8} radius={4} />
          <Skeleton width={176} height={8} radius={4} />
          <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'stretch', marginTop: 6 }}>
            <Skeleton width="49%" height={28} radius={14} strong style={{ flex: 1 }} />
            <Skeleton width="49%" height={28} radius={14} strong style={{ flex: 1 }} />
          </View>
        </View>
      </View>
      <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Skeleton width={64} height={10} radius={5} />
          <Skeleton width={44} height={8} radius={4} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={{ width: '31.5%', flexGrow: 1 }}>
              <Skeleton height={136} radius={14} strong />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
