import { View } from 'react-native';

import { Skeleton } from '@/components';
import { useTheme } from '@/theme';

/** Count line + two-column result tiles (photo 150, or 252-high video tiles). Also used for Saved talent. */
export function TalentGridSkeleton({ videos, count = true, rows = 3 }: { videos?: boolean; count?: boolean; rows?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 12 }} accessibilityLabel="Loading results" accessibilityState={{ busy: true }}>
      {count ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
          <Skeleton width={110} height={10} radius={5} />
          <Skeleton width={70} height={10} radius={5} />
        </View>
      ) : null}
      {Array.from({ length: rows }, (_, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 12 }}>
          {[0, 1].map((i) =>
            videos ? (
              <View key={i} style={{ flex: 1 }}>
                <Skeleton height={252} radius={20} strong />
              </View>
            ) : (
              <View key={i} style={{ flex: 1, backgroundColor: c.surface, borderRadius: 20, overflow: 'hidden' }}>
                <Skeleton height={150} radius={0} strong />
                <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 14, gap: 8 }}>
                  <Skeleton width="45%" height={10} radius={5} />
                  <Skeleton width={(r + i) % 2 ? '70%' : '60%'} height={8} radius={4} />
                </View>
              </View>
            ),
          )}
        </View>
      ))}
    </View>
  );
}

/** TalentSearchSkeleton: the results area of Talent search. */
export function TalentSearchSkeleton({ videos }: { videos?: boolean }) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <TalentGridSkeleton videos={videos} />
    </View>
  );
}
