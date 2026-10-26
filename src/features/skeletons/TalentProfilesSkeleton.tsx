import { View } from 'react-native';

import { Skeleton } from '@/components';
import { useTheme } from '@/theme';

/** TalentProfilesSkeleton: rows of talent tiles (photo 128 + two lines), or video tiles 138×230. */
export function TalentProfilesSkeleton({ videos }: { videos?: boolean }) {
  const { c } = useTheme();
  return (
    <View accessibilityLabel="Loading talent" accessibilityState={{ busy: true }}>
      {[0, 1, 2].map((r) => (
        <View key={r} style={{ paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 10 }}>
            <Skeleton width={r % 2 ? 110 : 86} height={14} radius={7} />
            <Skeleton width={28} height={10} radius={5} />
            <View style={{ flex: 1 }} />
            <Skeleton width={36} height={36} radius={12} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, overflow: 'hidden' }}>
            {[0, 1, 2].map((i) =>
              videos ? (
                <Skeleton key={i} width={138} height={230} radius={20} strong />
              ) : (
                <View key={i} style={{ width: 128, backgroundColor: c.surface, borderRadius: 20, overflow: 'hidden' }}>
                  <Skeleton height={128} radius={0} strong />
                  <View style={{ paddingHorizontal: 11, paddingTop: 11, paddingBottom: 13, gap: 7 }}>
                    <Skeleton width="55%" height={10} radius={5} />
                    <Skeleton width="85%" height={8} radius={4} />
                  </View>
                </View>
              ),
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
